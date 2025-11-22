import { Membership } from '../types';

/**
 * Membership service
 * Currently using hardcoded membership tiers
 * In the future, this could be connected to Firestore for dynamic pricing
 */

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  description: string;
  benefits: string[];
  popular?: boolean;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
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

/**
 * Get all available membership tiers
 */
export const getMembershipTiers = (): MembershipTier[] => {
  return MEMBERSHIP_TIERS;
};

/**
 * Get a specific membership tier by ID
 */
export const getMembershipTierById = (tierId: string): MembershipTier | null => {
  return MEMBERSHIP_TIERS.find(tier => tier.id === tierId) || null;
};

/**
 * Calculate membership expiry date
 */
export const calculateMembershipExpiry = (duration: number, startDate: Date = new Date()): Date => {
  const expiryDate = new Date(startDate);
  expiryDate.setMonth(expiryDate.getMonth() + duration);
  return expiryDate;
};

/**
 * Check if membership is expiring soon (within 30 days)
 */
export const isMembershipExpiringSoon = (expiryDate: Date): boolean => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiryDate <= thirtyDaysFromNow && expiryDate > now;
};

/**
 * Check if membership has expired
 */
export const isMembershipExpired = (expiryDate: Date): boolean => {
  return expiryDate < new Date();
};

