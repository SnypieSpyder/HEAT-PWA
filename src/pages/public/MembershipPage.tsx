import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Card, CardContent, Badge, Button, Alert } from '../../components/ui';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  description: string;
  benefits: string[];
  popular?: boolean;
}

const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'annual',
    name: 'Annual Membership',
    price: 299,
    duration: 12,
    description: 'Best value for committed families',
    benefits: [
      'Access to all classes and sports programs',
      'Priority registration for events',
      'Family discount on additional programs',
      '10% off all merchandise',
      'Members-only events and activities',
      'Free guest passes (2 per year)',
      'Access to member portal and resources',
    ],
    popular: true,
  },
];

export const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, familyData } = useAuth();
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const handlePurchase = (tier: MembershipTier) => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (!familyData) {
      return;
    }

    // Add membership to cart
    addToCart({
      itemId: tier.id,
      itemType: 'membership',
      title: tier.name,
      price: tier.price,
      quantity: 1,
      memberIds: [], // Membership applies to entire family
      metadata: {
        duration: tier.duration,
      },
    });

    setSelectedTier(tier.id);
    setAddedToCart(true);

    // Navigate to cart after a short delay
    setTimeout(() => {
      navigate('/cart');
    }, 1000);
  };

  const currentMembership = familyData?.membershipStatus === 'active';
  const expiryDate = familyData?.membershipExpiry 
    ? new Date(familyData.membershipExpiry)
    : null;
  const isExpiringSoon = expiryDate 
    ? expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Membership Plans
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Join our community and get unlimited access to all classes, sports programs, 
            and exclusive member benefits.
          </p>
        </div>

        {/* Current Membership Status */}
        {currentMembership && !isExpiringSoon && (
          <Alert
            type="success"
            message={`Your membership is active until ${expiryDate?.toLocaleDateString()}`}
            className="mb-8"
          />
        )}

        {isExpiringSoon && (
          <Alert
            type="warning"
            message={`Your membership expires on ${expiryDate?.toLocaleDateString()}. Renew now to continue your benefits!`}
            className="mb-8"
          />
        )}

        {addedToCart && (
          <Alert
            type="success"
            message="Membership added to cart! Redirecting to checkout..."
            className="mb-8"
          />
        )}

        {/* Membership Tier */}
        <div className="max-w-2xl mx-auto mb-12">
          {MEMBERSHIP_TIERS.map((tier) => (
            <Card
              key={tier.id}
              className="relative border-2 border-primary-600 shadow-xl"
            >

              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">{tier.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-primary-600">
                      ${tier.price}
                    </span>
                    <span className="text-neutral-600">/{tier.duration} months</span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    ${(tier.price / tier.duration).toFixed(2)} per month
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(tier)}
                  disabled={addedToCart && selectedTier === tier.id}
                  variant="primary"
                >
                  {currentMembership ? 'Renew Membership' : 'Purchase Membership'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <Card>
          <CardContent>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Membership Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Unlimited Access
                </h3>
                <p className="text-neutral-600">
                  Enroll in as many classes and sports programs as you like with your 
                  active membership.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Family Coverage
                </h3>
                <p className="text-neutral-600">
                  One membership covers your entire family. Add as many family members 
                  as you need.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Exclusive Events
                </h3>
                <p className="text-neutral-600">
                  Get access to members-only events, workshops, and community activities 
                  throughout the year.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Priority Registration
                </h3>
                <p className="text-neutral-600">
                  Members get early access to register for popular programs before they 
                  fill up.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-2">
                Have Questions?
              </h3>
              <p className="text-neutral-600 mb-4">
                Contact us if you have any questions about membership benefits or need 
                help choosing the right plan for your family.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

