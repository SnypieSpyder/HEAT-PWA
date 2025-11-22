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
import { Event } from '../types';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

export const getEvents = async (constraints: QueryConstraint[] = []): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('organizationId', '==', ORGANIZATION_ID), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Event[];
  } catch (error) {
    throw error;
  }
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) return null;
    
    return {
      id: eventDoc.id,
      ...eventDoc.data(),
      date: eventDoc.data().date?.toDate(),
      createdAt: eventDoc.data().createdAt?.toDate(),
      updatedAt: eventDoc.data().updatedAt?.toDate(),
    } as Event;
  } catch (error) {
    throw error;
  }
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      organizationId: ORGANIZATION_ID, // Multi-tenant support
      registered: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    throw error;
  }
};

