import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Alert } from '../ui';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface StripePaymentFormProps {
  amount: number;
  cartItems: any[];
  familyId: string;
  onSuccess: (orderId: string) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  cartItems,
  familyId,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded');
      return;
    }

    console.log('=== Starting payment process ===');
    console.log('Amount:', amount);
    console.log('Cart items:', cartItems);
    console.log('Family ID:', familyId);

    setProcessing(true);
    setError('');

    try {
      // Step 1: Check authentication
      console.log('Checking authentication...');
      const { auth } = await import('../../services/firebase');
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified
      } : 'NOT LOGGED IN');
      
      if (!currentUser) {
        throw new Error('You must be logged in to make a payment');
      }

      // Get fresh auth token
      console.log('Getting auth token...');
      const token = await currentUser.getIdToken(true);
      console.log('Auth token obtained:', token ? 'yes' : 'no');
      
      // Step 2: Create Payment Intent via Cloud Function
      console.log('Calling createPaymentIntent function...');
      console.log('Functions instance:', functions);
      console.log('Function region:', functions.region);
      
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      console.log('Callable function created');
      
      const result = await createPaymentIntent({
        amount,
        currency: 'usd',
        cartItems,
      });

      console.log('createPaymentIntent result:', result);
      const { clientSecret } = result.data as any;
      console.log('Client secret received:', clientSecret ? 'yes' : 'no');

      // Step 2: Confirm Card Payment with Stripe
      console.log('Getting card element...');
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        console.error('Card element not found');
        throw new Error('Card element not found');
      }

      console.log('Confirming card payment with Stripe...');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        console.error('Stripe payment error:', stripeError);
        throw new Error(stripeError.message);
      }

      console.log('Payment intent status:', paymentIntent?.status);

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Step 3: Create Order in Database via Cloud Function
        console.log('Creating order...');
        const createOrder = httpsCallable(functions, 'createOrder');
        const subtotal = amount / 1.03; // Remove processing fee
        
        const orderResult = await createOrder({
          paymentIntentId: paymentIntent.id,
          cartItems,
          familyId,
          subtotal,
          total: amount,
        });

        console.log('Order created:', orderResult);
        const { orderId } = orderResult.data as any;
        console.log('Redirecting to success page...');
        onSuccess(orderId);
      }
    } catch (err: any) {
      console.error('Payment error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        fullError: err
      });
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-neutral-700">
            Card Information
          </label>
          <div className="flex items-center text-xs text-neutral-500">
            <span className="mr-2">Powered by</span>
            <svg className="h-4" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 01-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 00-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF"/>
            </svg>
          </div>
        </div>
        <div className="p-4 border-2 border-neutral-300 rounded-lg bg-white focus-within:border-primary-600 transition-colors">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Note: The "Autofill" link above is a browser feature to help you fill in saved card details
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      <Button
        type="submit"
        disabled={!stripe || processing}
        isLoading={processing}
        className="w-full"
      >
        {processing ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
      </Button>

      <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500">
        <LockClosedIcon className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
};

