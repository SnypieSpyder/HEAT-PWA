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
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Class } from '../types';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

export const getClasses = async (constraints: QueryConstraint[] = []): Promise<Class[]> => {
  try {
    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('organizationId', '==', ORGANIZATION_ID), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Class[];
  } catch (error) {
    throw error;
  }
};

export const getClassById = async (classId: string): Promise<Class | null> => {
  try {
    const classDoc = await getDoc(doc(db, 'classes', classId));
    if (!classDoc.exists()) return null;
    
    return {
      id: classDoc.id,
      ...classDoc.data(),
      startDate: classDoc.data().startDate?.toDate(),
      endDate: classDoc.data().endDate?.toDate(),
      createdAt: classDoc.data().createdAt?.toDate(),
      updatedAt: classDoc.data().updatedAt?.toDate(),
    } as Class;
  } catch (error) {
    throw error;
  }
};

export const createClass = async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      organizationId: ORGANIZATION_ID, // Multi-tenant support
      enrolled: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateClass = async (classId: string, classData: Partial<Class>): Promise<void> => {
  try {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      ...classData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteClass = async (classId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (error) {
    throw error;
  }
};

