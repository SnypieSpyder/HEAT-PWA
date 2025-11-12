import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, Button, Alert, Badge } from '../../components/ui';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, familyData } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentUser || cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const processingFee = cartTotal * 0.03;
  const total = cartTotal + processingFee;

  const handleSubmitOrder = async () => {
    try {
      setError('');
      setIsProcessing(true);

      // TODO: Implement actual payment processing
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearCart();
      navigate('/dashboard/orders?success=true');
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-600 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">Credit/Debit Card</p>
                      <p className="text-sm text-neutral-600">
                        Pay securely with Stripe
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-600 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">PayPal</p>
                      <p className="text-sm text-neutral-600">
                        Pay with your PayPal account
                      </p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'stripe' && (
                  <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600 mb-4">
                      Stripe payment integration will be configured with your account.
                    </p>
                    <Elements stripe={stripePromise}>
                      <div className="text-center text-neutral-500">
                        Payment form will appear here
                      </div>
                    </Elements>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">
                      PayPal payment integration will be configured with your account.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent>
                <label className="flex items-start">
                  <input type="checkbox" className="mt-1 mr-3" required />
                  <p className="text-sm text-neutral-600">
                    I agree to the terms and conditions and understand that all sales are
                    final. Refund requests must be submitted in writing and are subject to
                    approval.
                  </p>
                </label>
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

                <Button
                  className="w-full"
                  onClick={handleSubmitOrder}
                  isLoading={isProcessing}
                >
                  Complete Purchase
                </Button>

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

