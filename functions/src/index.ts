import * as functions from 'firebase-functions/v2';
import { onCall, onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';

admin.initializeApp();

// Define secrets using the new V2 params API
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

/**
 * Create Payment Intent
 * Called from frontend to initiate payment
 */
export const createPaymentIntent = onCall({ 
  secrets: [stripeSecretKey],
  region: 'us-central1',
}, async (request) => {
  console.log('=== createPaymentIntent called ===');
  console.log('Request auth:', request.auth ? 'authenticated' : 'not authenticated');
  console.log('Request origin:', request.rawRequest?.headers?.origin);
  console.log('Request data:', JSON.stringify(request.data));

  // Initialize Stripe inside the function to access the secret safely
  // Trim any whitespace from the secret key
  const secretKey = stripeSecretKey.value().trim();
  
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });

  // Verify user is authenticated
  if (!request.auth) {
    console.error('Authentication failed: no auth context');
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, currency = 'usd', cartItems } = request.data;

  try {
    console.log('Calculating order amount...');
    // Validate amount (recalculate on server to prevent tampering)
    const calculatedAmount = await calculateOrderAmount(cartItems);
    console.log('Calculated amount:', calculatedAmount, 'Received amount:', amount);

    if (Math.abs(calculatedAmount - amount) > 0.01) { // Allow for rounding
      console.error('Amount mismatch:', { calculatedAmount, amount });
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Amount mismatch: expected ${calculatedAmount}, got ${amount}`
      );
    }

    console.log('Creating Stripe payment intent...');
    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      metadata: {
        userId: request.auth.uid,
        cartItemsCount: cartItems.length.toString(),
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    console.error('Error stack:', error.stack);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Calculate order amount from cart items
 * Server-side validation to prevent price tampering
 */
async function calculateOrderAmount(cartItems: any[]): Promise<number> {
  let total = 0;

  for (const item of cartItems) {
    try {
      // For memberships, use the price from cart (hardcoded tiers, not in Firestore)
      if (item.itemType === 'membership') {
        total += item.price * (item.quantity || 1);
        continue;
      }

      // Determine collection name based on item type
      const collectionName = item.itemType === 'class' ? 'classes' :
                            item.itemType === 'sport' ? 'sports' :
                            item.itemType === 'event' ? 'events' : null;

      if (!collectionName) {
        throw new Error(`Unknown item type: ${item.itemType}`);
      }

      // Fetch actual price from Firestore
      const itemRef = admin.firestore().collection(collectionName).doc(item.itemId);
      const itemDoc = await itemRef.get();

      if (!itemDoc.exists) {
        throw new Error(`Item ${item.itemId} not found`);
      }

      const actualPrice = itemDoc.data()?.pricing || 0;
      total += actualPrice * (item.quantity || 1);
    } catch (error) {
      console.error(`Error fetching item ${item.itemId}:`, error);
      throw error;
    }
  }

  // Add 3% processing fee
  const processingFee = total * 0.03;
  return total + processingFee;
}

/**
 * Create Order after successful payment
 * Called from frontend after payment confirmation
 */
export const createOrder = onCall({ 
  secrets: [stripeSecretKey],
  region: 'us-central1',
}, async (request) => {
  // Initialize Stripe inside the function
  // Trim any whitespace from the secret key
  const secretKey = stripeSecretKey.value().trim();
  
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });

  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { paymentIntentId, cartItems, familyId, subtotal, total } = request.data;

  try {
    // Verify payment was successful with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Payment not successful'
      );
    }

    // Verify the user owns this family
    const userDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.familyId !== familyId) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid family ID');
    }

    // Create order in Firestore
    const orderData = {
      familyId,
      items: cartItems.map((item: any) => ({
        itemId: item.itemId,
        itemType: item.itemType,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        memberIds: item.memberIds || [],
      })),
      subtotal,
      discount: 0,
      total,
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      paymentIntentId: paymentIntent.id,
      organizationId: 'tampabayheat', // Multi-tenant support
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = await admin.firestore().collection('orders').add(orderData);

    // Create enrollments for each item
    const batch = admin.firestore().batch();
    let membershipItem: any = null;

    for (const item of cartItems) {
      // Check if this is a membership purchase
      if (item.itemType === 'membership') {
        membershipItem = item;
      }

      const enrollmentData = {
        familyId,
        itemId: item.itemId,
        itemType: item.itemType,
        memberIds: item.memberIds || [],
        status: 'active',
        orderId: orderRef.id,
        organizationId: 'tampabayheat', // Multi-tenant support
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const enrollmentRef = admin.firestore().collection('enrollments').doc();
      batch.set(enrollmentRef, enrollmentData);

      // Update enrollment count for the item
      const collectionName = item.itemType === 'class' ? 'classes' :
                            item.itemType === 'sport' ? 'sports' :
                            item.itemType === 'event' ? 'events' : null;

      if (collectionName) {
        const itemRef = admin.firestore().collection(collectionName).doc(item.itemId);
        batch.update(itemRef, {
          enrolled: admin.firestore.FieldValue.increment(item.quantity || 1),
        });
      }
    }

    // If membership was purchased, update family membership status
    if (membershipItem) {
      const familyRef = admin.firestore().collection('families').doc(familyId);
      const duration = membershipItem.metadata?.duration || 12; // Default to 12 months
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + duration);

      batch.update(familyRef, {
        membershipStatus: 'active',
        membershipExpiry: admin.firestore.Timestamp.fromDate(expiryDate),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      orderId: orderRef.id,
      success: true,
      message: 'Order created successfully',
    };
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Webhook handler for Stripe events
 * Handles payment confirmations and updates
 */
export const stripeWebhook = onRequest({ secrets: [stripeSecretKey, stripeWebhookSecret] }, async (req, res) => {
  // Initialize Stripe inside the function
  // Trim any whitespace from the secret key
  const secretKey = stripeSecretKey.value().trim();
  
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      stripeWebhookSecret.value()
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // Additional logic if needed
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', failedPayment.id);
        // Handle failed payment
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
