// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'family' | 'admin';
  familyId: string;
  createdAt: Date;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'parent' | 'child' | 'guardian';
  dateOfBirth?: Date;
  gradeLevel?: string;
  photoURL?: string;
  email?: string;
  phone?: string;
}

export interface Family {
  id: string;
  familyName: string;
  primaryContactId: string;
  members: FamilyMember[];
  address?: Address;
  membershipStatus: 'active' | 'expired' | 'none';
  membershipExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// Classes, Sports, and Events Types
export interface Class {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  schedule: Schedule;
  capacity: number;
  enrolled: number;
  pricing: number;
  ageRequirement?: string;
  gradeRequirement?: string;
  prerequisites?: string[];
  materials?: string;
  imageURL?: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'full' | 'cancelled';
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  dayOfWeek: string[];
  startTime: string;
  endTime: string;
  location?: string;
}

export interface Sport {
  id: string;
  title: string;
  description: string;
  sportType: string;
  season: string;
  coachId?: string;
  coachName?: string;
  schedule: Schedule;
  capacity: number;
  enrolled: number;
  pricing: number;
  ageGroup: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  imageURL?: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'full' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  ticketTypes: TicketType[];
  capacity?: number;
  registered: number;
  imageURL?: string;
  flyerURL?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio: string;
  specialties: string[];
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  familyId: string;
  itemId: string;
  itemType: 'class' | 'sport' | 'event' | 'membership';
  memberIds: string[]; // Which family members are enrolled
  status: 'active' | 'completed' | 'cancelled' | 'waitlist';
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart and Order Types
export interface CartItem {
  id: string;
  itemId: string;
  itemType: 'class' | 'sport' | 'event' | 'membership';
  title: string;
  price: number;
  quantity: number;
  memberIds: string[]; // Which family members this is for
  metadata?: any;
}

export interface Order {
  id: string;
  familyId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'stripe' | 'paypal';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  itemId: string;
  itemType: 'class' | 'sport' | 'event' | 'membership';
  title: string;
  price: number;
  quantity: number;
  memberIds: string[];
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usageCount: number;
  applicableTo?: string[]; // item types or specific item IDs
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'class' | 'sport' | 'event' | 'deadline' | 'other';
  color?: string;
  relatedId?: string; // ID of the related class/sport/event
  isAllDay?: boolean;
}

// Content Management Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'members' | 'admins';
  expiryDate?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface PageContent {
  id: string;
  pageName: string;
  sections: ContentSection[];
  updatedAt: Date;
  updatedBy: string;
}

export interface ContentSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'testimonials' | 'features';
  content: any;
  order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  createdAt: Date;
}

// Analytics Types
export interface AnalyticsData {
  totalFamilies: number;
  activeMemberships: number;
  totalRevenue: number;
  enrollmentCount: number;
  popularClasses: {itemId: string; title: string; count: number}[];
  popularSports: {itemId: string; title: string; count: number}[];
  recentOrders: Order[];
}

