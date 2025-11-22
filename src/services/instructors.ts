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
import { Instructor } from '../types';
import { updateUserRole } from './users';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

export const getInstructors = async (constraints: QueryConstraint[] = []): Promise<Instructor[]> => {
  try {
    const instructorsRef = collection(db, 'instructors');
    const q = query(instructorsRef, where('organizationId', '==', ORGANIZATION_ID), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Instructor[];
  } catch (error) {
    throw error;
  }
};

export const getInstructorById = async (instructorId: string): Promise<Instructor | null> => {
  try {
    const instructorDoc = await getDoc(doc(db, 'instructors', instructorId));
    if (!instructorDoc.exists()) return null;
    
    return {
      id: instructorDoc.id,
      ...instructorDoc.data(),
      createdAt: instructorDoc.data().createdAt?.toDate(),
      updatedAt: instructorDoc.data().updatedAt?.toDate(),
    } as Instructor;
  } catch (error) {
    throw error;
  }
};

export const createInstructor = async (instructorData: Omit<Instructor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'instructors'), {
      ...instructorData,
      organizationId: ORGANIZATION_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // If userId is provided, update the user's role to instructor
    if (instructorData.userId) {
      await updateUserRole(instructorData.userId, 'instructor');
    }
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateInstructor = async (instructorId: string, instructorData: Partial<Instructor>): Promise<void> => {
  try {
    const instructorRef = doc(db, 'instructors', instructorId);
    await updateDoc(instructorRef, {
      ...instructorData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteInstructor = async (instructorId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'instructors', instructorId));
  } catch (error) {
    throw error;
  }
};

