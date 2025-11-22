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
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Family } from '../types';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

// Helper to find if user matches existing family member
const findMatchingFamilyMember = async (email: string, phone?: string) => {
  const familiesRef = collection(db, 'families');
  const q = query(familiesRef, where('organizationId', '==', ORGANIZATION_ID));
  const snapshot = await getDocs(q);
  
  for (const familyDoc of snapshot.docs) {
    const family = familyDoc.data() as Family;
    const matchingMember = family.members.find(
      member => member.email === email || (phone && member.phone === phone)
    );
    
    if (matchingMember) {
      return { familyId: familyDoc.id, memberId: matchingMember.id };
    }
  }
  return null;
};

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

    // Check if user matches existing family member
    // Note: This will fail with permission error for non-admin users, which is expected
    let matchingFamily = null;
    try {
      matchingFamily = await findMatchingFamilyMember(email, phone);
    } catch (error) {
      // If permission denied (user can't list families), treat as no match
      console.log('Could not search for matching family member (expected for new users)');
      matchingFamily = null;
    }
    
    let familyId: string;
    
    if (matchingFamily) {
      // User matches existing family member - link to that family
      familyId = matchingFamily.familyId;
      
      // Update the family member with user ID
      const familyRef = doc(db, 'families', familyId);
      const familyDoc = await getDoc(familyRef);
      if (familyDoc.exists()) {
        const family = familyDoc.data() as Family;
        const updatedMembers = family.members.map(m => 
          m.id === matchingFamily.memberId 
            ? { ...m, id: firebaseUser.uid }
            : m
        );
        await updateDoc(familyRef, { 
          members: updatedMembers,
          updatedAt: serverTimestamp()
        });
      }
    } else {
      // Create new family
      familyId = firebaseUser.uid; // Use user ID as family ID for primary contact
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
        organizationId: ORGANIZATION_ID, // Multi-tenant support
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

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
      organizationId: ORGANIZATION_ID, // Multi-tenant support
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
      const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
      
      // Check if user matches existing family member
      // Note: This will fail with permission error for non-admin users, which is expected
      let matchingFamily = null;
      try {
        matchingFamily = await findMatchingFamilyMember(firebaseUser.email || '');
      } catch (error) {
        // If permission denied (user can't list families), treat as no match
        console.log('Could not search for matching family member (expected for new users)');
        matchingFamily = null;
      }
      
      let familyId: string;
      
      if (matchingFamily) {
        // User matches existing family member - link to that family
        familyId = matchingFamily.familyId;
        
        // Update the family member with user ID
        const familyRef = doc(db, 'families', familyId);
        const familyDoc = await getDoc(familyRef);
        if (familyDoc.exists()) {
          const family = familyDoc.data() as Family;
          const updatedMembers = family.members.map(m => 
            m.id === matchingFamily.memberId 
              ? { ...m, id: firebaseUser.uid }
              : m
          );
          await updateDoc(familyRef, { 
            members: updatedMembers,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // Create new family
        familyId = firebaseUser.uid;
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
          organizationId: ORGANIZATION_ID, // Multi-tenant support
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

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
        organizationId: ORGANIZATION_ID, // Multi-tenant support
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

