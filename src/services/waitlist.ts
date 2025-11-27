import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { WaitlistEntry } from '../types';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

/**
 * Join a waitlist for a class, sport, or event
 */
export const joinWaitlist = async (
  itemId: string,
  itemType: 'class' | 'sport' | 'event',
  familyId: string,
  memberIds: string[]
): Promise<string> => {
  try {
    // Get current waitlist entries to determine position
    const waitlistRef = collection(db, 'waitlist');
    const q = query(
      waitlistRef,
      where('itemId', '==', itemId),
      where('itemType', '==', itemType),
      where('organizationId', '==', ORGANIZATION_ID),
      orderBy('position', 'desc')
    );
    const snapshot = await getDocs(q);
    
    // New position is max + 1, or 1 if no entries
    const maxPosition = snapshot.empty ? 0 : (snapshot.docs[0].data().position || 0);
    const newPosition = maxPosition + 1;

    const waitlistData = {
      itemId,
      itemType,
      familyId,
      memberIds,
      position: newPosition,
      status: 'waiting' as const,
      organizationId: ORGANIZATION_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(waitlistRef, waitlistData);
    return docRef.id;
  } catch (error) {
    console.error('Error joining waitlist:', error);
    throw error;
  }
};

/**
 * Get all waitlist entries for a specific item
 */
export const getWaitlistByItem = async (
  itemId: string,
  itemType: 'class' | 'sport' | 'event'
): Promise<WaitlistEntry[]> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(
      waitlistRef,
      where('itemId', '==', itemId),
      where('itemType', '==', itemType),
      where('organizationId', '==', ORGANIZATION_ID),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as WaitlistEntry;
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    throw error;
  }
};

/**
 * Get all waitlist entries for a specific family
 */
export const getWaitlistByFamily = async (familyId: string): Promise<WaitlistEntry[]> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(
      waitlistRef,
      where('familyId', '==', familyId),
      where('organizationId', '==', ORGANIZATION_ID),
      where('status', '==', 'waiting')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as WaitlistEntry;
    });
  } catch (error) {
    console.error('Error fetching family waitlist:', error);
    throw error;
  }
};

/**
 * Check if a family is on the waitlist for a specific item
 */
export const checkWaitlistStatus = async (
  itemId: string,
  itemType: 'class' | 'sport' | 'event',
  familyId: string
): Promise<WaitlistEntry | null> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(
      waitlistRef,
      where('itemId', '==', itemId),
      where('itemType', '==', itemType),
      where('familyId', '==', familyId),
      where('organizationId', '==', ORGANIZATION_ID),
      where('status', '==', 'waiting')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as WaitlistEntry;
  } catch (error) {
    console.error('Error checking waitlist status:', error);
    throw error;
  }
};

/**
 * Update the position of a waitlist entry
 */
export const updateWaitlistPosition = async (
  entryId: string,
  newPosition: number
): Promise<void> => {
  try {
    const entryRef = doc(db, 'waitlist', entryId);
    await updateDoc(entryRef, {
      position: newPosition,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating waitlist position:', error);
    throw error;
  }
};

/**
 * Remove a family from the waitlist
 */
export const removeFromWaitlist = async (entryId: string): Promise<void> => {
  try {
    const entryRef = doc(db, 'waitlist', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error removing from waitlist:', error);
    throw error;
  }
};

/**
 * Reorder waitlist entries for an item
 * Takes an array of entry IDs in the desired order
 */
export const reorderWaitlist = async (
  _itemId: string,
  _itemType: 'class' | 'sport' | 'event',
  orderedEntryIds: string[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    orderedEntryIds.forEach((entryId, index) => {
      const entryRef = doc(db, 'waitlist', entryId);
      batch.update(entryRef, {
        position: index + 1,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error reordering waitlist:', error);
    throw error;
  }
};

/**
 * Get all waitlist entries across all items (for admin view)
 */
export const getAllWaitlistEntries = async (): Promise<WaitlistEntry[]> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(
      waitlistRef,
      where('organizationId', '==', ORGANIZATION_ID),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as WaitlistEntry;
    });
  } catch (error) {
    console.error('Error fetching all waitlist entries:', error);
    throw error;
  }
};

