import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Sport } from '../types';

export const getSports = async (constraints: QueryConstraint[] = []): Promise<Sport[]> => {
  try {
    const sportsRef = collection(db, 'sports');
    const q = query(sportsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Sport[];
  } catch (error) {
    throw error;
  }
};

export const getSportById = async (sportId: string): Promise<Sport | null> => {
  try {
    const sportDoc = await getDoc(doc(db, 'sports', sportId));
    if (!sportDoc.exists()) return null;
    
    return {
      id: sportDoc.id,
      ...sportDoc.data(),
      startDate: sportDoc.data().startDate?.toDate(),
      endDate: sportDoc.data().endDate?.toDate(),
      createdAt: sportDoc.data().createdAt?.toDate(),
      updatedAt: sportDoc.data().updatedAt?.toDate(),
    } as Sport;
  } catch (error) {
    throw error;
  }
};

export const createSport = async (sportData: Omit<Sport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'sports'), {
      ...sportData,
      enrolled: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateSport = async (sportId: string, sportData: Partial<Sport>): Promise<void> => {
  try {
    const sportRef = doc(db, 'sports', sportId);
    await updateDoc(sportRef, {
      ...sportData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteSport = async (sportId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'sports', sportId));
  } catch (error) {
    throw error;
  }
};

