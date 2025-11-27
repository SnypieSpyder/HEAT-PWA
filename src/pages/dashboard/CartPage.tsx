import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, Button, Badge } from '../../components/ui';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();

  if (!currentUser) {
    return (
      <div className="container-custom py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent>
            <ShoppingCartIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Please Sign In
            </h2>
            <p className="text-neutral-600 mb-6">
              You need to be signed in to view your cart
            </p>
            <Link to="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-12">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent>
            <ShoppingCartIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-neutral-600 mb-6">
              Start adding classes, sports, or events to your cart
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/classes">
                <Button>Browse Classes</Button>
              </Link>
              <Link to="/sports">
                <Button variant="outline">Browse Sports</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between pb-4 border-b border-neutral-200 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="primary">{item.itemType}</Badge>
                          <span className="text-sm text-neutral-600">
                            {item.memberIds.length} member(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-neutral-600 px-3 py-1">Qty: {item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-neutral-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-neutral-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <Button variant="outline" onClick={clearCart} size="sm">
                    Clear Cart
                  </Button>
                </div>
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
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Processing Fee</span>
                    <span>${(cartTotal * 0.03).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-neutral-900">
                      <span>Total</span>
                      <span>${(cartTotal * 1.03).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mb-3" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>

                <Link to="/classes">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>

                <div className="mt-6 pt-6 border-t border-neutral-200 text-sm text-neutral-600">
                  <p className="mb-2">
                    <strong>Secure Checkout</strong>
                  </p>
                  <p>
                    Your payment information is processed securely. We do not store credit
                    card details.
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

