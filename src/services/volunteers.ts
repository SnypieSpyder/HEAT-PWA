import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { VolunteerOpportunity, VolunteerSignup } from '../types';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

export const getVolunteerOpportunities = async (constraints: QueryConstraint[] = []): Promise<VolunteerOpportunity[]> => {
  try {
    const opportunitiesRef = collection(db, 'volunteerOpportunities');
    const q = query(opportunitiesRef, where('organizationId', '==', ORGANIZATION_ID), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        slots: data.slots?.map((slot: any) => ({
          ...slot,
          signups: slot.signups?.map((signup: any) => ({
            ...signup,
            createdAt: signup.createdAt?.toDate ? signup.createdAt.toDate() : new Date(signup.createdAt),
          })) || [],
        })) || [],
      };
    }) as VolunteerOpportunity[];
  } catch (error) {
    throw error;
  }
};

export const getVolunteerOpportunityById = async (opportunityId: string): Promise<VolunteerOpportunity | null> => {
  try {
    const opportunityDoc = await getDoc(doc(db, 'volunteerOpportunities', opportunityId));
    if (!opportunityDoc.exists()) return null;
    
    const data = opportunityDoc.data();
    return {
      id: opportunityDoc.id,
      ...data,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      slots: data.slots?.map((slot: any) => ({
        ...slot,
        signups: slot.signups?.map((signup: any) => ({
          ...signup,
          createdAt: signup.createdAt?.toDate ? signup.createdAt.toDate() : new Date(signup.createdAt),
        })) || [],
      })) || [],
    } as VolunteerOpportunity;
  } catch (error) {
    throw error;
  }
};

export const createVolunteerOpportunity = async (
  opportunityData: Omit<VolunteerOpportunity, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'volunteerOpportunities'), {
      ...opportunityData,
      organizationId: ORGANIZATION_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateVolunteerOpportunity = async (
  opportunityId: string,
  opportunityData: Partial<VolunteerOpportunity>
): Promise<void> => {
  try {
    const opportunityRef = doc(db, 'volunteerOpportunities', opportunityId);
    await updateDoc(opportunityRef, {
      ...opportunityData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteVolunteerOpportunity = async (opportunityId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'volunteerOpportunities', opportunityId));
  } catch (error) {
    throw error;
  }
};

export const addVolunteerSignup = async (
  opportunityId: string,
  slotId: string,
  signup: Omit<VolunteerSignup, 'id' | 'createdAt'>
): Promise<void> => {
  try {
    const opportunity = await getVolunteerOpportunityById(opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');

    // Check if THIS SPECIFIC USER is already signed up for ANY slot in this opportunity
    // Only match on non-empty identifiers to allow children without email/accounts to volunteer
    // Each person (identified by userId) can only sign up for one slot per opportunity
    const alreadySignedUp = opportunity.slots.some(slot => 
      slot.signups.some(existingSignup => {
        // Only match on userId if both have valid, non-empty userIds
        const userIdMatch = 
          signup.userId && 
          existingSignup.userId && 
          signup.userId.trim() !== '' && 
          existingSignup.userId.trim() !== '' &&
          existingSignup.userId === signup.userId;

        // Only match on email if both have valid, non-empty emails
        // This is a fallback for users without accounts
        const emailMatch = 
          signup.email && 
          existingSignup.email && 
          signup.email.trim() !== '' && 
          existingSignup.email.trim() !== '' &&
          existingSignup.email === signup.email;

        return userIdMatch || emailMatch;
      })
    );

    if (alreadySignedUp) {
      throw new Error('This person is already signed up for a slot in this opportunity. Each person can only sign up for one slot per opportunity.');
    }

    // Check if the specific slot is full
    const targetSlot = opportunity.slots.find(slot => slot.id === slotId);
    if (targetSlot && targetSlot.signups.length >= targetSlot.capacity) {
      throw new Error('This slot is already full.');
    }

    const updatedSlots = opportunity.slots.map(slot => {
      if (slot.id === slotId) {
        const newSignup: VolunteerSignup = {
          ...signup,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        return {
          ...slot,
          signups: [...slot.signups, newSignup],
        };
      }
      return slot;
    });

    await updateVolunteerOpportunity(opportunityId, { slots: updatedSlots });
  } catch (error) {
    throw error;
  }
};

export const removeVolunteerSignup = async (
  opportunityId: string,
  slotId: string,
  signupId: string
): Promise<void> => {
  try {
    const opportunity = await getVolunteerOpportunityById(opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');

    const updatedSlots = opportunity.slots.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          signups: slot.signups.filter(s => s.id !== signupId),
        };
      }
      return slot;
    });

    await updateVolunteerOpportunity(opportunityId, { slots: updatedSlots });
  } catch (error) {
    throw error;
  }
};

export const getActiveVolunteerOpportunities = async (): Promise<VolunteerOpportunity[]> => {
  try {
    return await getVolunteerOpportunities([where('status', '==', 'active')]);
  } catch (error) {
    throw error;
  }
};

/**
 * Get volunteer opportunities for a specific event
 */
export const getVolunteerOpportunitiesByEventId = async (eventId: string): Promise<VolunteerOpportunity[]> => {
  try {
    return await getVolunteerOpportunities([
      where('eventId', '==', eventId),
      where('status', '==', 'active')
    ]);
  } catch (error) {
    throw error;
  }
};

/**
 * Get volunteer opportunities filtered for the public volunteer tab
 * This includes non-event volunteers and event volunteers where listInTab is true
 */
export const getPublicVolunteerOpportunities = async (): Promise<VolunteerOpportunity[]> => {
  try {
    const allActive = await getActiveVolunteerOpportunities();
    // Filter to show only:
    // 1. Non-event volunteer opportunities (no eventId)
    // 2. Event volunteer opportunities where listInTab is true
    return allActive.filter(opp => !opp.eventId || opp.listInTab === true);
  } catch (error) {
    throw error;
  }
};

