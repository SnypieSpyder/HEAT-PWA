import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Family } from '../types';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

export const getFamilies = async (constraints: QueryConstraint[] = []): Promise<Family[]> => {
  try {
    const familiesRef = collection(db, 'families');
    const q = query(familiesRef, where('organizationId', '==', ORGANIZATION_ID), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        membershipExpiry: data.membershipExpiry?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        members: data.members?.map((member: any) => ({
          ...member,
          dateOfBirth: member.dateOfBirth?.toDate(),
        })) || [],
      };
    }) as Family[];
  } catch (error) {
    throw error;
  }
};

export const getFamilyById = async (familyId: string): Promise<Family | null> => {
  try {
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (!familyDoc.exists()) return null;
    
    const data = familyDoc.data();
    return {
      id: familyDoc.id,
      ...data,
      membershipExpiry: data.membershipExpiry?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      members: data.members?.map((member: any) => ({
        ...member,
        dateOfBirth: member.dateOfBirth?.toDate(),
      })) || [],
    } as Family;
  } catch (error) {
    throw error;
  }
};

export const updateFamily = async (familyId: string, familyData: Partial<Family>): Promise<void> => {
  try {
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, {
      ...familyData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const searchFamilies = async (searchTerm: string): Promise<Family[]> => {
  try {
    // Get all families and filter client-side for now
    // For production, consider using Algolia or similar for better search
    const families = await getFamilies();
    const lowerSearch = searchTerm.toLowerCase();
    
    return families.filter(family => 
      family.familyName.toLowerCase().includes(lowerSearch) ||
      family.members.some(member => 
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(lowerSearch) ||
        member.email?.toLowerCase().includes(lowerSearch)
      )
    );
  } catch (error) {
    throw error;
  }
};

