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
import { Event, VolunteerOpportunity, VolunteerSlot } from '../types';
import {
  createVolunteerOpportunity,
  updateVolunteerOpportunity,
  deleteVolunteerOpportunity,
  getVolunteerOpportunitiesByEventId,
} from './volunteers';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

export const getEvents = async (constraints: QueryConstraint[] = []): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('organizationId', '==', ORGANIZATION_ID), ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Event[];
  } catch (error) {
    throw error;
  }
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) return null;
    
    return {
      id: eventDoc.id,
      ...eventDoc.data(),
      date: eventDoc.data().date?.toDate(),
      createdAt: eventDoc.data().createdAt?.toDate(),
      updatedAt: eventDoc.data().updatedAt?.toDate(),
    } as Event;
  } catch (error) {
    throw error;
  }
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> & { volunteerSlots?: VolunteerSlot[] }): Promise<string> => {
  try {
    const { volunteerSlots, ...eventDataWithoutSlots } = eventData;
    
    // Clean the data to remove any undefined/null values
    const cleanedEventData: any = {};
    Object.entries(eventDataWithoutSlots).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanedEventData[key] = value;
      }
    });
    
    const docRef = await addDoc(collection(db, 'events'), {
      ...cleanedEventData,
      organizationId: ORGANIZATION_ID, // Multi-tenant support
      registered: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const eventId = docRef.id;
    
    // If volunteers are enabled, create a volunteer opportunity
    if (eventData.volunteerEnabled && volunteerSlots && volunteerSlots.length > 0) {
      await syncEventVolunteerOpportunity(eventId, eventData, volunteerSlots);
    }
    
    return eventId;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<Event> & { volunteerSlots?: VolunteerSlot[] }): Promise<void> => {
  try {
    const { volunteerSlots, ...eventDataWithoutSlots } = eventData;
    
    // Clean the data to remove any undefined/null values
    const cleanedEventData: any = {};
    Object.entries(eventDataWithoutSlots).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanedEventData[key] = value;
      }
    });
    
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...cleanedEventData,
      updatedAt: serverTimestamp(),
    });
    
    // Get the existing event to access all fields
    const existingEvent = await getEventById(eventId);
    if (!existingEvent) throw new Error('Event not found');
    
    // Merge the updated data with existing event data
    const mergedEventData = { ...existingEvent, ...eventData };
    
    // Handle volunteer opportunity synchronization
    if (mergedEventData.volunteerEnabled && volunteerSlots && volunteerSlots.length > 0) {
      await syncEventVolunteerOpportunity(eventId, mergedEventData, volunteerSlots);
    } else if (mergedEventData.volunteerEnabled === false) {
      // If volunteers were disabled, delete any existing volunteer opportunity
      await deleteEventVolunteerOpportunity(eventId);
    }
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    // First, delete any associated volunteer opportunity
    await deleteEventVolunteerOpportunity(eventId);
    
    // Then delete the event
    await deleteDoc(doc(db, 'events', eventId));
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to sync volunteer opportunity for an event
 */
const syncEventVolunteerOpportunity = async (
  eventId: string,
  eventData: Partial<Event>,
  volunteerSlots: VolunteerSlot[]
): Promise<void> => {
  try {
    // Check if a volunteer opportunity already exists for this event
    const existingOpportunities = await getVolunteerOpportunitiesByEventId(eventId);
    
    const opportunityData: Omit<VolunteerOpportunity, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${eventData.title} - Volunteer Opportunities`,
      description: `Help us make ${eventData.title} a success! Sign up to volunteer.`,
      date: eventData.date || new Date(),
      startTime: eventData.startTime || '',
      endTime: eventData.endTime || '',
      location: eventData.location || '',
      slots: volunteerSlots,
      eventId: eventId,
      listInTab: eventData.volunteerListInTab || false,
      status: 'active',
    };
    
    if (existingOpportunities.length > 0) {
      // Update existing volunteer opportunity
      await updateVolunteerOpportunity(existingOpportunities[0].id, opportunityData);
    } else {
      // Create new volunteer opportunity
      await createVolunteerOpportunity(opportunityData);
    }
  } catch (error) {
    console.error('Error syncing volunteer opportunity:', error);
    throw error;
  }
};

/**
 * Helper function to delete volunteer opportunity associated with an event
 */
const deleteEventVolunteerOpportunity = async (eventId: string): Promise<void> => {
  try {
    const existingOpportunities = await getVolunteerOpportunitiesByEventId(eventId);
    for (const opportunity of existingOpportunities) {
      await deleteVolunteerOpportunity(opportunity.id);
    }
  } catch (error) {
    console.error('Error deleting event volunteer opportunity:', error);
    // Don't throw - this is a cleanup operation
  }
};

