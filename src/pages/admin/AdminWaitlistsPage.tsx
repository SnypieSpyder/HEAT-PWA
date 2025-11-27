import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Spinner, Alert, Badge, Button } from '../../components/ui';
import { getAllWaitlistEntries, removeFromWaitlist, reorderWaitlist } from '../../services/waitlist';
import { getClassById } from '../../services/classes';
import { getSportById } from '../../services/sports';
import { getEventById } from '../../services/events';
import { WaitlistEntry, Family } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  AcademicCapIcon, 
  TrophyIcon, 
  CalendarIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface WaitlistWithDetails {
  entry: WaitlistEntry;
  itemTitle: string;
  familyName: string;
  memberNames: string[];
}

interface GroupedWaitlist {
  itemId: string;
  itemType: 'class' | 'sport' | 'event';
  itemTitle: string;
  entries: WaitlistWithDetails[];
}

export const AdminWaitlistsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groupedWaitlists, setGroupedWaitlists] = useState<GroupedWaitlist[]>([]);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [reorderingItem, setReorderingItem] = useState<string | null>(null);

  useEffect(() => {
    fetchAllWaitlists();
  }, []);

  const fetchAllWaitlists = async () => {
    try {
      setLoading(true);
      const entries = await getAllWaitlistEntries();

      // Group by item
      const grouped: { [key: string]: WaitlistEntry[] } = {};
      entries.forEach(entry => {
        const key = `${entry.itemType}-${entry.itemId}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(entry);
      });

      // Fetch details for each item and family
      const detailedGroups: GroupedWaitlist[] = [];

      for (const [, items] of Object.entries(grouped)) {
        const firstEntry = items[0];
        let itemTitle = 'Unknown';

        // Fetch item details
        try {
          if (firstEntry.itemType === 'class') {
            const classData = await getClassById(firstEntry.itemId);
            itemTitle = classData?.title || 'Unknown Class';
          } else if (firstEntry.itemType === 'sport') {
            const sportData = await getSportById(firstEntry.itemId);
            itemTitle = sportData?.title || 'Unknown Sport';
          } else if (firstEntry.itemType === 'event') {
            const eventData = await getEventById(firstEntry.itemId);
            itemTitle = eventData?.title || 'Unknown Event';
          }
        } catch (err) {
          console.error('Error fetching item details:', err);
        }

        // Fetch family details for each entry
        const entriesWithDetails: WaitlistWithDetails[] = [];
        for (const entry of items) {
          try {
            const familyDoc = await getDoc(doc(db, 'families', entry.familyId));
            const familyData = familyDoc.exists() ? familyDoc.data() as Family : null;

            const memberNames = familyData 
              ? entry.memberIds.map(memberId => {
                  const member = familyData.members.find(m => m.id === memberId);
                  return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
                })
              : [];

            entriesWithDetails.push({
              entry,
              itemTitle,
              familyName: familyData?.familyName || 'Unknown Family',
              memberNames,
            });
          } catch (err) {
            console.error('Error fetching family details:', err);
            entriesWithDetails.push({
              entry,
              itemTitle,
              familyName: 'Unknown Family',
              memberNames: [],
            });
          }
        }

        // Sort by position
        entriesWithDetails.sort((a, b) => a.entry.position - b.entry.position);

        detailedGroups.push({
          itemId: firstEntry.itemId,
          itemType: firstEntry.itemType,
          itemTitle,
          entries: entriesWithDetails,
        });
      }

      setGroupedWaitlists(detailedGroups);
    } catch (err: any) {
      setError('Failed to load waitlists: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleRemove = async (entryId: string) => {
    if (!confirm('Are you sure you want to remove this person from the waitlist?')) {
      return;
    }

    try {
      await removeFromWaitlist(entryId);
      await fetchAllWaitlists(); // Refresh
    } catch (err: any) {
      setError('Failed to remove from waitlist: ' + err.message);
    }
  };

  const handleMoveUp = async (group: GroupedWaitlist, index: number) => {
    if (index === 0) return;

    const newEntries = [...group.entries];
    [newEntries[index - 1], newEntries[index]] = [newEntries[index], newEntries[index - 1]];

    await reorderEntries(group, newEntries);
  };

  const handleMoveDown = async (group: GroupedWaitlist, index: number) => {
    if (index === group.entries.length - 1) return;

    const newEntries = [...group.entries];
    [newEntries[index], newEntries[index + 1]] = [newEntries[index + 1], newEntries[index]];

    await reorderEntries(group, newEntries);
  };

  const reorderEntries = async (group: GroupedWaitlist, newOrder: WaitlistWithDetails[]) => {
    setReorderingItem(group.itemId);
    try {
      const orderedIds = newOrder.map(e => e.entry.id);
      await reorderWaitlist(group.itemId, group.itemType, orderedIds);
      await fetchAllWaitlists(); // Refresh
    } catch (err: any) {
      setError('Failed to reorder waitlist: ' + err.message);
    } finally {
      setReorderingItem(null);
    }
  };

  const getItemIcon = (type: 'class' | 'sport' | 'event') => {
    switch (type) {
      case 'class':
        return <AcademicCapIcon className="h-5 w-5 text-primary-600" />;
      case 'sport':
        return <TrophyIcon className="h-5 w-5 text-green-600" />;
      case 'event':
        return <CalendarIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Manage Waitlists</h1>
            <p className="text-neutral-600 mt-2">
              View and manage waitlist entries for all programs
            </p>
          </div>
          <Button onClick={fetchAllWaitlists} variant="outline">
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {groupedWaitlists.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <UserGroupIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Waitlists</h3>
                <p className="text-neutral-600">
                  There are currently no active waitlist entries.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedWaitlists.map((group) => (
              <Card key={`${group.itemType}-${group.itemId}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getItemIcon(group.itemType)}
                      <div>
                        <CardTitle>{group.itemTitle}</CardTitle>
                        <p className="text-sm text-neutral-600 capitalize">
                          {group.itemType} • {group.entries.length} on waitlist
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(group.itemId)}
                    >
                      {expandedItems.has(group.itemId) ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </CardHeader>

                {expandedItems.has(group.itemId) && (
                  <CardContent>
                    <div className="space-y-3">
                      {group.entries.map((entry, index) => (
                        <div
                          key={entry.entry.id}
                          className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold">
                              {entry.entry.position}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900">
                                {entry.familyName}
                              </p>
                              <p className="text-sm text-neutral-600">
                                Members: {entry.memberNames.join(', ')}
                              </p>
                              <p className="text-xs text-neutral-500">
                                Joined {new Date(entry.entry.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="info">{entry.entry.status}</Badge>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleMoveUp(group, index)}
                              disabled={index === 0 || reorderingItem === group.itemId}
                              className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Move Up"
                            >
                              <ArrowUpIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(group, index)}
                              disabled={index === group.entries.length - 1 || reorderingItem === group.itemId}
                              className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Move Down"
                            >
                              <ArrowDownIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRemove(entry.entry.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove from Waitlist"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

