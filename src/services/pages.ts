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
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Page } from '../types';

const PAGES_COLLECTION = 'pages';

// Helper to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any): Page => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Page;
};

// Get all pages (for admin)
export const getPages = async (): Promise<Page[]> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const q = query(pagesRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      ...convertTimestamps(doc.data()),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

// Get published pages only (for public)
export const getPublishedPages = async (): Promise<Page[]> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const q = query(
      pagesRef,
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      ...convertTimestamps(doc.data()),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching published pages:', error);
    throw error;
  }
};

// Get pages for navigation menu (root pages only)
export const getNavigationPages = async (): Promise<Page[]> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const q = query(
      pagesRef,
      where('status', '==', 'published'),
      where('showInNav', '==', true),
      where('parentId', '==', null),
      orderBy('navOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      ...convertTimestamps(doc.data()),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching navigation pages:', error);
    throw error;
  }
};

// Get child pages of a parent
export const getChildPages = async (
  parentId: string,
  publishedOnly = false
): Promise<Page[]> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const constraints: any[] = [
      where('parentId', '==', parentId),
      orderBy('title', 'asc')
    ];
    
    if (publishedOnly) {
      constraints.unshift(where('status', '==', 'published'));
    }
    
    const q = query(pagesRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      ...convertTimestamps(doc.data()),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching child pages:', error);
    throw error;
  }
};

// Get parent pages only (for dropdown selection)
export const getParentPages = async (): Promise<Page[]> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const q = query(
      pagesRef,
      where('parentId', '==', null),
      orderBy('title', 'asc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      ...convertTimestamps(doc.data()),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching parent pages:', error);
    throw error;
  }
};

// Get page by full slug path (handles nested URLs)
export const getPageByFullSlug = async (fullSlug: string): Promise<Page | null> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    // Query for published pages only (for public access)
    const q = query(
      pagesRef, 
      where('fullSlug', '==', fullSlug),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      ...convertTimestamps(snapshot.docs[0].data()),
      id: snapshot.docs[0].id,
    };
  } catch (error) {
    console.error('Error fetching page by full slug:', error);
    throw error;
  }
};

// Build full slug from parent chain
export const buildFullSlug = async (slug: string, parentId?: string): Promise<string> => {
  if (!parentId) {
    return slug;
  }
  
  try {
    const parent = await getPageById(parentId);
    if (!parent) {
      return slug;
    }
    
    const parentFullSlug = parent.fullSlug || parent.slug;
    return `${parentFullSlug}/${slug}`;
  } catch (error) {
    console.error('Error building full slug:', error);
    return slug;
  }
};

// Search sub-pages with filters
export const searchSubPages = async (
  parentId: string,
  searchTerm?: string,
  category?: string,
  tags?: string[]
): Promise<Page[]> => {
  try {
    let pages = await getChildPages(parentId, true);
    
    // Client-side filtering (Firestore doesn't support complex OR queries)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      pages = pages.filter((p) => 
        p.title.toLowerCase().includes(lowerSearch) ||
        p.metaDescription?.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (category) {
      pages = pages.filter((p) => p.category === category);
    }
    
    if (tags && tags.length > 0) {
      pages = pages.filter((p) => 
        p.tags && p.tags.some((tag) => tags.includes(tag))
      );
    }
    
    return pages;
  } catch (error) {
    console.error('Error searching sub-pages:', error);
    throw error;
  }
};

// Get single page by slug
export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const q = query(pagesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      ...convertTimestamps(doc.data()),
      id: doc.id,
    };
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    throw error;
  }
};

// Get single page by ID
export const getPageById = async (id: string): Promise<Page | null> => {
  try {
    const pageRef = doc(db, PAGES_COLLECTION, id);
    const snapshot = await getDoc(pageRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      ...convertTimestamps(snapshot.data()),
      id: snapshot.id,
    };
  } catch (error) {
    console.error('Error fetching page by ID:', error);
    throw error;
  }
};

// Create new page
export const createPage = async (
  data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const now = Timestamp.now();
    
    // Set defaults for backward compatibility
    const pageData: any = { ...data };
    if (!pageData.parentId) pageData.parentId = null;
    if (!pageData.fullSlug) pageData.fullSlug = data.slug;
    
    const docRef = await addDoc(pagesRef, {
      ...pageData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
};

// Update existing page
export const updatePage = async (
  id: string,
  data: Partial<Omit<Page, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const pageRef = doc(db, PAGES_COLLECTION, id);
    const now = Timestamp.now();
    
    // Set defaults for backward compatibility
    const updateData: any = { ...data };
    if (updateData.parentId === undefined) updateData.parentId = null;
    if (!updateData.fullSlug && updateData.slug) updateData.fullSlug = updateData.slug;
    
    await updateDoc(pageRef, {
      ...updateData,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
};

// Delete page
export const deletePage = async (id: string): Promise<void> => {
  try {
    const pageRef = doc(db, PAGES_COLLECTION, id);
    await deleteDoc(pageRef);
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
};

// Check if slug is available (for validation)
export const isSlugAvailable = async (
  slug: string,
  excludePageId?: string
): Promise<boolean> => {
  try {
    const pagesRef = collection(db, PAGES_COLLECTION);
    const q = query(pagesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return true;
    }
    
    // If we're editing a page, allow the current page's slug
    if (excludePageId) {
      return snapshot.docs.every((doc) => doc.id === excludePageId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    throw error;
  }
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

