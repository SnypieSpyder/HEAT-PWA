import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

/**
 * Update a user's role
 */
export const updateUserRole = async (userId: string, role: User['role']): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Get a user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    
    return {
      uid: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate(),
    } as User;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

