import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Enrollment } from '../types';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

export const getEnrollmentsByFamily = async (familyId: string): Promise<Enrollment[]> => {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('organizationId', '==', ORGANIZATION_ID),
      where('familyId', '==', familyId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Enrollment[];
  } catch (error) {
    throw error;
  }
};

export const getEnrollmentsByItem = async (
  itemId: string,
  itemType: 'class' | 'sport' | 'event'
): Promise<Enrollment[]> => {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('organizationId', '==', ORGANIZATION_ID),
      where('itemId', '==', itemId),
      where('itemType', '==', itemType)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Enrollment[];
  } catch (error) {
    throw error;
  }
};

export const createEnrollment = async (
  enrollmentData: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'enrollments'), {
      ...enrollmentData,
      organizationId: ORGANIZATION_ID, // Multi-tenant support
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateEnrollment = async (
  enrollmentId: string,
  enrollmentData: Partial<Enrollment>
): Promise<void> => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentRef, {
      ...enrollmentData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteEnrollment = async (enrollmentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'enrollments', enrollmentId));
  } catch (error) {
    throw error;
  }
};

export const checkEnrollmentExists = async (
  familyId: string,
  itemId: string,
  itemType: 'class' | 'sport' | 'event'
): Promise<boolean> => {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('organizationId', '==', ORGANIZATION_ID),
      where('familyId', '==', familyId),
      where('itemId', '==', itemId),
      where('itemType', '==', itemType),
      where('status', 'in', ['active', 'waitlist'])
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    throw error;
  }
};

