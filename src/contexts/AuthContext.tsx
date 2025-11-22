import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, Family } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  familyData: Family | null;
  loading: boolean;
  isAdmin: boolean;
  refreshFamilyData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  familyData: null,
  loading: true,
  isAdmin: false,
  refreshFamilyData: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Retry logic for newly created users
        const maxRetries = 10;
        const retryDelay = 500; // ms
        
        let retryCount = 0;
        let userDataFetched = false;

        while (retryCount < maxRetries && !userDataFetched) {
          try {
            // Fetch user data
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (userDoc.exists()) {
              const userDataFromDb = { uid: user.uid, ...userDoc.data() } as User;
              setUserData(userDataFromDb);

              // Fetch family data
              if (userDataFromDb.familyId) {
                const familyDoc = await getDoc(doc(db, 'families', userDataFromDb.familyId));
                
                if (familyDoc.exists()) {
                  const data = familyDoc.data();
                  const familyDataFromDb = { 
                    id: familyDoc.id, 
                    ...data,
                    membershipExpiry: data.membershipExpiry?.toDate ? data.membershipExpiry.toDate() : data.membershipExpiry,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
                  } as Family;
                  setFamilyData(familyDataFromDb);
                  userDataFetched = true;
                } else {
                  console.log(`Family document not found (attempt ${retryCount + 1}/${maxRetries}), retrying...`);
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  retryCount++;
                }
              } else {
                userDataFetched = true; // User exists but no family
              }
            } else {
              console.log(`User document not found (attempt ${retryCount + 1}/${maxRetries}), retrying...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              retryCount++;
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
          }
        }

        if (!userDataFetched) {
          console.error('Failed to load user data after maximum retries');
        }
      } else {
        setUserData(null);
        setFamilyData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = userData?.role === 'admin';

  const refreshFamilyData = async () => {
    if (userData?.familyId) {
      try {
        const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
        if (familyDoc.exists()) {
          const data = familyDoc.data();
          const familyDataFromDb = { 
            id: familyDoc.id, 
            ...data,
            membershipExpiry: data.membershipExpiry?.toDate ? data.membershipExpiry.toDate() : data.membershipExpiry,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          } as Family;
          setFamilyData(familyDataFromDb);
        }
      } catch (error) {
        console.error('Error refreshing family data:', error);
      }
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    familyData,
    loading,
    isAdmin,
    refreshFamilyData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

