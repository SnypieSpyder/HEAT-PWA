import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { CalendarItem, Event, Class, Sport } from '../types';
import { getEnrollmentsByFamily } from './enrollments';

// Organization ID for multi-tenant support (hardcoded for now)
const ORGANIZATION_ID = 'tampabayheat';

// Color scheme for calendar items
const COLORS = {
  event: '#dc2626', // red (primary-600)
  class: '#2563eb', // blue
  sport: '#16a34a', // green
};

/**
 * Fetch all calendar items for a user
 * - All events (public)
 * - Enrolled classes and sports (if user is logged in)
 */
export const getCalendarItems = async (familyId?: string): Promise<CalendarItem[]> => {
  const calendarItems: CalendarItem[] = [];

  try {
    // 1. Fetch all upcoming/ongoing events (public)
    // Fetch all events and filter by organization in the app (for backward compatibility)
    const eventsRef = collection(db, 'events');
    const eventsSnapshot = await getDocs(eventsRef);
    
    eventsSnapshot.forEach((docSnapshot) => {
      const event = docSnapshot.data() as Event;
      const eventDate = (event.date as any)?.toDate ? (event.date as any).toDate() : new Date(event.date);
      
      // Only include upcoming or ongoing events
      // Include events without organizationId for backward compatibility
      const belongsToOrg = !event.organizationId || event.organizationId === ORGANIZATION_ID;
      
      if ((event.status === 'upcoming' || event.status === 'ongoing') && belongsToOrg) {
        calendarItems.push({
          id: docSnapshot.id,
          title: event.title,
          type: 'event',
          date: eventDate,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          color: COLORS.event,
          isEnrolled: false, // Events don't have enrollment in this context
          itemData: {
            ...event,
            id: docSnapshot.id,
            date: eventDate,
            createdAt: (event.createdAt as any)?.toDate ? (event.createdAt as any).toDate() : new Date(),
            updatedAt: (event.updatedAt as any)?.toDate ? (event.updatedAt as any).toDate() : new Date(),
          },
        });
      }
    });

    // 2. If user is logged in, fetch enrolled classes and sports
    if (familyId) {
      const enrollments = await getEnrollmentsByFamily(familyId);
      
      // Filter for active enrollments of classes and sports
      const activeEnrollments = enrollments.filter(
        (e) => e.status === 'active' && (e.itemType === 'class' || e.itemType === 'sport')
      );

      // Fetch class details
      const classEnrollments = activeEnrollments.filter((e) => e.itemType === 'class');
      for (const enrollment of classEnrollments) {
        try {
          const classDoc = await getDoc(doc(db, 'classes', enrollment.itemId));
          if (classDoc.exists()) {
            const classData = classDoc.data() as Class;
            
            // Add calendar items for each day of the week the class meets
            const daysOfWeek = classData.schedule.dayOfWeek;
            const startDate = (classData.startDate as any)?.toDate ? (classData.startDate as any).toDate() : new Date(classData.startDate);
            const endDate = (classData.endDate as any)?.toDate ? (classData.endDate as any).toDate() : new Date(classData.endDate);
            
            // Generate dates for all occurrences
            const dates = generateRecurringDates(startDate, endDate, daysOfWeek);
            
            dates.forEach((date) => {
              calendarItems.push({
                id: `${classDoc.id}-${date.getTime()}`,
                title: classData.title,
                type: 'class',
                date: date,
                startTime: classData.schedule.startTime,
                endTime: classData.schedule.endTime,
                location: classData.schedule.location || '',
                color: COLORS.class,
                isEnrolled: true,
                itemData: {
                  ...classData,
                  id: classDoc.id,
                  startDate: startDate,
                  endDate: endDate,
                  createdAt: (classData.createdAt as any)?.toDate ? (classData.createdAt as any).toDate() : new Date(),
                  updatedAt: (classData.updatedAt as any)?.toDate ? (classData.updatedAt as any).toDate() : new Date(),
                },
              });
            });
          }
        } catch (error) {
          console.error('Error fetching class:', error);
        }
      }

      // Fetch sport details
      const sportEnrollments = activeEnrollments.filter((e) => e.itemType === 'sport');
      for (const enrollment of sportEnrollments) {
        try {
          const sportDoc = await getDoc(doc(db, 'sports', enrollment.itemId));
          if (sportDoc.exists()) {
            const sportData = sportDoc.data() as Sport;
            
            // Add calendar items for each day of the week the sport meets
            const daysOfWeek = sportData.schedule.dayOfWeek;
            const startDate = (sportData.startDate as any)?.toDate ? (sportData.startDate as any).toDate() : new Date(sportData.startDate);
            const endDate = (sportData.endDate as any)?.toDate ? (sportData.endDate as any).toDate() : new Date(sportData.endDate);
            
            // Generate dates for all occurrences
            const dates = generateRecurringDates(startDate, endDate, daysOfWeek);
            
            dates.forEach((date) => {
              calendarItems.push({
                id: `${sportDoc.id}-${date.getTime()}`,
                title: sportData.title,
                type: 'sport',
                date: date,
                startTime: sportData.schedule.startTime,
                endTime: sportData.schedule.endTime,
                location: sportData.schedule.location || '',
                color: COLORS.sport,
                isEnrolled: true,
                itemData: {
                  ...sportData,
                  id: sportDoc.id,
                  startDate: startDate,
                  endDate: endDate,
                  createdAt: (sportData.createdAt as any)?.toDate ? (sportData.createdAt as any).toDate() : new Date(),
                  updatedAt: (sportData.updatedAt as any)?.toDate ? (sportData.updatedAt as any).toDate() : new Date(),
                },
              });
            });
          }
        } catch (error) {
          console.error('Error fetching sport:', error);
        }
      }
    }

    return calendarItems;
  } catch (error) {
    console.error('Error fetching calendar items:', error);
    throw error;
  }
};

/**
 * Generate recurring dates based on days of week
 * @param startDate - Start date of the recurring event
 * @param endDate - End date of the recurring event
 * @param daysOfWeek - Array of day names (e.g., ['Monday', 'Wednesday', 'Friday'])
 */
function generateRecurringDates(
  startDate: Date,
  endDate: Date,
  daysOfWeek: string[]
): Date[] {
  const dates: Date[] = [];
  const dayMap: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  };

  // Convert day names to numbers
  const dayNumbers = daysOfWeek.map((day) => dayMap[day]).filter((num) => num !== undefined);

  // Iterate through each day from start to end
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayNumbers.includes(dayOfWeek)) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

