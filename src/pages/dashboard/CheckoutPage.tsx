import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, Alert, Badge } from '../../components/ui';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../../components/checkout';

// Only load Stripe if key is configured
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, familyData } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Redirect to cart if not logged in or cart is empty (but not during payment processing)
  useEffect(() => {
    if (!currentUser || (cartItems.length === 0 && !isProcessingPayment)) {
      navigate('/cart');
    }
  }, [currentUser, cartItems.length, isProcessingPayment, navigate]);

  // Don't render if we don't have the necessary data
  if (!currentUser || !familyData || (cartItems.length === 0 && !isProcessingPayment)) {
    return null;
  }

  const processingFee = cartTotal * 0.03;
  const total = cartTotal + processingFee;

  const handlePaymentSuccess = (orderId: string) => {
    setIsProcessingPayment(true);
    clearCart();
    // Use setTimeout to ensure cart clears before navigation
    setTimeout(() => {
      navigate(`/enrollments?success=true&orderId=${orderId}`);
    }, 100);
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Family Information */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Family Information
                </h2>
                <div className="space-y-2 text-neutral-700">
                  <p>
                    <strong>Family:</strong> {familyData?.familyName}
                  </p>
                  <p>
                    <strong>Primary Contact:</strong> {currentUser.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Payment Method
                </h2>

                {stripePromise ? (
                  <div className="mt-6">
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm
                        amount={total}
                        cartItems={cartItems}
                        familyId={familyData.id}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      Stripe is not configured. Please add your Stripe publishable key to the environment variables.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent>
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 mr-3" 
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required 
                  />
                  <p className="text-sm text-neutral-600">
                    I agree to the terms and conditions and understand that all sales are
                    final. Refund requests must be submitted in writing and are subject to
                    approval.
                  </p>
                </label>
                {!agreeToTerms && (
                  <p className="text-xs text-red-600 mt-2">
                    You must agree to the terms and conditions to complete your purchase.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pb-3 border-b border-neutral-200">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-neutral-900">{item.title}</span>
                        <span className="text-neutral-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="primary" size="sm">
                          {item.itemType}
                        </Badge>
                        <span className="text-xs text-neutral-600">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between text-neutral-600 pt-3">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Processing Fee (3%)</span>
                    <span>${processingFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-neutral-900">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>


                <div className="mt-6 pt-6 border-t border-neutral-200 text-xs text-neutral-600">
                  <p className="mb-2">
                    <strong>Secure Payment</strong>
                  </p>
                  <p>
                    Your payment is processed securely. We never store your payment
                    information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

