import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Family } from '../types';

export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  familyName: string,
  phone?: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update profile
    await updateProfile(firebaseUser, { displayName });

    // Create family document
    const familyId = firebaseUser.uid; // Use user ID as family ID for primary contact
    const familyData: Partial<Family> = {
      id: familyId,
      familyName,
      primaryContactId: firebaseUser.uid,
      members: [
        {
          id: firebaseUser.uid,
          firstName: displayName.split(' ')[0] || displayName,
          lastName: displayName.split(' ')[1] || '',
          relationship: 'parent',
          email,
          phone,
        },
      ],
      membershipStatus: 'none',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'families', familyId), {
      ...familyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create user document
    const userData: Partial<User> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      role: 'family',
      familyId,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    return userData as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      // Create new user and family
      const familyId = firebaseUser.uid;
      const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
      
      const familyData: Partial<Family> = {
        id: familyId,
        familyName: displayName + ' Family',
        primaryContactId: firebaseUser.uid,
        members: [
          {
            id: firebaseUser.uid,
            firstName: displayName.split(' ')[0] || displayName,
            lastName: displayName.split(' ')[1] || '',
            relationship: 'parent',
            email: firebaseUser.email || '',
          },
        ],
        membershipStatus: 'none',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'families', familyId), {
        ...familyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const userData: Partial<User> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        photoURL: firebaseUser.photoURL || undefined,
        role: 'family',
        familyId,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
      });

      return userData as User;
    }

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
};

