import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteActivity,
  getOrCreateItinerary,
} from '../../../services/itineraryService';

import {
  ItineraryActivity,
  ItineraryDay,
  ItineraryTimePeriod,
  TripItinerary,
} from '../../../types/itinerary';

const TRIPS_STORAGE_KEY = 'flightfits.trips';

type SavedTrip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget?: number;
  luggageType: string;
  activities: string[];
  createdAt: string;
};

const PERIOD_DETAILS: Record<
  ItineraryTimePeriod,
  {
    title: string;
    emoji: string;
  }
> = {
  morning: {
    title: 'Morning',
    emoji: '☀️',
  },
  afternoon: {
    title: 'Afternoon',
    emoji: '🌤️',
  },
  evening: {
    title: 'Evening',
    emoji: '🌙',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(time?: string): string {
  if (!time) {
    return '';
  }

  const [hoursString, minutesString] = time.split(':');
  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatActivityTime(
  activity: ItineraryActivity
): string {
  if (activity.startTime && activity.endTime) {
    return `${formatTime(activity.startTime)} – ${formatTime(
      activity.endTime
    )}`;
  }

  if (activity.startTime) {
    return formatTime(activity.startTime);
  }

  return 'Time not set';
}

export default function ItineraryScreen() {
  const params = useLocalSearchParams<{
    tripId?: string | string[];
  }>();

  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const [trip, setTrip] = useState<SavedTrip | null>(null);

  const [itinerary, setItinerary] =
    useState<TripItinerary | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadItinerary = useCallback(async () => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const storedTrips = await AsyncStorage.getItem(
        TRIPS_STORAGE_KEY
      );

      const trips: SavedTrip[] = storedTrips
        ? JSON.parse(storedTrips)
        : [];

      const matchingTrip = trips.find(
        (savedTrip) => savedTrip.id === tripId
      );

      if (!matchingTrip) {
        setTrip(null);
        setItinerary(null);
        return;
      }

      setTrip(matchingTrip);

      const tripItinerary = await getOrCreateItinerary(
        matchingTrip.id,
        matchingTrip.startDate,
        matchingTrip.endDate
      );

      setItinerary(tripItinerary);
    } catch (error) {
      console.error(
        'Unable to load itinerary:',
        error
      );

      Alert.alert(
        'Unable to load itinerary',
        'Your itinerary could not be loaded. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadItinerary();
    }, [loadItinerary])
  );

  const openAddActivity = (
    date: string,
    period?: ItineraryTimePeriod
  ) => {
    if (!tripId) {
      return;
    }

    router.push({
      pathname: '/trip/[tripId]/add-activity',
      params: {
        tripId,
        date,
        period: period ?? 'morning',
      },
    });
  };

  const openEditActivity = (
    activity: ItineraryActivity
  ) => {
    if (!tripId) {
      return;
    }

    router.push({
      pathname: '/trip/[tripId]/edit-activity',
      params: {
        tripId,
        activityId: activity.id,
      },
    });
  };

  const confirmDeleteActivity = (
    activity: ItineraryActivity
  ) => {
    if (!tripId) {
      return;
    }

    Alert.alert(
      'Delete activity?',
      `Remove "${activity.title}" from your itinerary?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteActivity(
                tripId,
                activity.id
              );

              await loadItinerary();
            } catch (error) {
              console.error(
                'Unable to delete activity:',
                error
              );

              Alert.alert(
                'Unable to delete activity',
                'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const renderActivity = (
    activity: ItineraryActivity
  ) => {
    return (
      <Pressable
        key={activity.id}
        onPress={() => openEditActivity(activity)}
        onLongPress={() =>
          confirmDeleteActivity(activity)
        }
        style={({ pressed }) => [
          styles.activityCard,
          pressed && styles.pressedCard,
        ]}
      >
        <View style={styles.activityTopRow}>
          <View style={styles.activityContent}>
            <Text style={styles.activityTime}>
              {formatActivityTime(activity)}
            </Text>

            <Text style={styles.activityTitle}>
              {activity.title}
            </Text>
          </View>

          <Text style={styles.activityArrow}>›</Text>
        </View>

        {activity.location && (
          <View style={styles.activityDetailRow}>
            <Text style={styles.activityDetailIcon}>
              📍
            </Text>

            <Text
              style={styles.activityDetailText}
              numberOfLines={2}
            >
              {activity.location}
            </Text>
          </View>
        )}

        {activity.address && (
          <View style={styles.activityDetailRow}>
            <Text style={styles.activityDetailIcon}>
              🗺️
            </Text>

            <Text
              style={styles.activityDetailText}
              numberOfLines={2}
            >
              {activity.address}
            </Text>
          </View>
        )}

        {activity.cost !== undefined && (
          <View style={styles.activityDetailRow}>
            <Text style={styles.activityDetailIcon}>
              💵
            </Text>

            <Text style={styles.activityDetailText}>
              $
              {activity.cost.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        )}

        {activity.notes && (
          <Text
            style={styles.activityNotes}
            numberOfLines={3}
          >
            {activity.notes}
          </Text>
        )}

        <Text style={styles.longPressHint}>
          Tap to edit • Hold to delete
        </Text>
      </Pressable>
    );
  };

  const renderPeriod = (
    day: ItineraryDay,
    period: ItineraryTimePeriod
  ) => {
    const periodDetails = PERIOD_DETAILS[period];

    const activities = day.activities.filter(
      (activity) => activity.period === period
    );

    return (
      <View
        key={`${day.id}-${period}`}
        style={styles.periodSection}
      >
        <View style={styles.periodHeader}>
          <View style={styles.periodHeading}>
            <Text style={styles.periodEmoji}>
              {periodDetails.emoji}
            </Text>

            <Text style={styles.periodTitle}>
              {periodDetails.title}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              openAddActivity(day.date, period)
            }
            style={({ pressed }) => [
              styles.smallAddButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.smallAddButtonText}>
              ＋ Add
            </Text>
          </Pressable>
        </View>

        {activities.length > 0 ? (
          <View style={styles.activityList}>
            {activities.map(renderActivity)}
          </View>
        ) : (
          <Pressable
            onPress={() =>
              openAddActivity(day.date, period)
            }
            style={({ pressed }) => [
              styles.emptyPeriod,
              pressed && styles.pressedCard,
            ]}
          >
            <Text style={styles.emptyPeriodText}>
              No {periodDetails.title.toLowerCase()}{' '}
              plans yet
            </Text>

            <Text style={styles.emptyPeriodAction}>
              Add an activity
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderDay = (day: ItineraryDay) => {
    const totalActivities = day.activities.length;

    return (
      <View key={day.id} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <View style={styles.dayNumberContainer}>
            <Text style={styles.dayNumber}>
              {day.dayNumber}
            </Text>
          </View>

          <View style={styles.dayHeading}>
            <Text style={styles.dayLabel}>
              DAY {day.dayNumber}
            </Text>

            <Text style={styles.dayDate}>
              {formatDate(day.date)}
            </Text>
          </View>

          <View style={styles.activityCountBadge}>
            <Text style={styles.activityCountText}>
              {totalActivities}
            </Text>
          </View>
        </View>

        {renderPeriod(day, 'morning')}
        {renderPeriod(day, 'afternoon')}
        {renderPeriod(day, 'evening')}

        <Pressable
          onPress={() => openAddActivity(day.date)}
          style={({ pressed }) => [
            styles.dayAddButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.dayAddButtonText}>
            ＋ Add activity to Day {day.dayNumber}
          </Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Building your itinerary...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip || !itinerary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Text style={styles.notFoundEmoji}>
            🧭
          </Text>

          <Text style={styles.notFoundTitle}>
            Trip not found
          </Text>

          <Text style={styles.notFoundDescription}>
            This trip may have been deleted or is no
            longer available.
          </Text>

          <Pressable
            onPress={() =>
              router.replace('/(tabs)/trips')
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Back to trips
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalActivities = itinerary.days.reduce(
    (total, day) =>
      total + day.activities.length,
    0
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>
            YOUR ITINERARY
          </Text>

          <Text style={styles.heroTitle}>
            {trip.name}
          </Text>

          <Text style={styles.heroDestination}>
            📍 {trip.destination}
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {itinerary.days.length}
              </Text>

              <Text style={styles.summaryLabel}>
                {itinerary.days.length === 1
                  ? 'Day'
                  : 'Days'}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {totalActivities}
              </Text>

              <Text style={styles.summaryLabel}>
                {totalActivities === 1
                  ? 'Activity'
                  : 'Activities'}
              </Text>
            </View>
          </View>
        </View>

        {itinerary.days.length > 0 ? (
          itinerary.days.map(renderDay)
        ) : (
          <View style={styles.noDaysCard}>
            <Text style={styles.noDaysEmoji}>
              📅
            </Text>

            <Text style={styles.noDaysTitle}>
              No itinerary days available
            </Text>

            <Text style={styles.noDaysDescription}>
              Check that your trip has valid start and
              end dates.
            </Text>
          </View>
        )}
      </ScrollView>

      {itinerary.days.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          <Pressable
            onPress={() =>
              openAddActivity(
                itinerary.days[0].date
              )
            }
            style={({ pressed }) => [
              styles.floatingButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.floatingButtonText}>
              ＋ Add activity
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F6',
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  heroCard: {
    marginBottom: 20,
    padding: 23,
    borderRadius: 24,
    backgroundColor: '#A15D43',
  },

  heroEyebrow: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#F8DDD1',
  },

  heroTitle: {
    marginBottom: 7,
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  heroDestination: {
    marginBottom: 20,
    fontSize: 15,
    color: '#F8E9E2',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    marginBottom: 3,
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8E9E2',
  },

  summaryDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  dayCard: {
    marginBottom: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E8DFDA',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  dayNumberContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#F7EAE4',
  },

  dayNumber: {
    fontSize: 19,
    fontWeight: '800',
    color: '#A15D43',
  },

  dayHeading: {
    flex: 1,
  },

  dayLabel: {
    marginBottom: 3,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#A15D43',
  },

  dayDate: {
    fontSize: 17,
    fontWeight: '800',
    color: '#292320',
  },

  activityCountBadge: {
    minWidth: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#F1ECE9',
  },

  activityCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#706762',
  },

  periodSection: {
    marginBottom: 20,
  },

  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  periodHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  periodEmoji: {
    marginRight: 7,
    fontSize: 17,
  },

  periodTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#413A36',
  },

  smallAddButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F7EAE4',
  },

  smallAddButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A15D43',
  },

  activityList: {
    gap: 9,
  },

  activityCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAE3DF',
    borderRadius: 16,
    backgroundColor: '#FFFCFA',
  },

  activityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityContent: {
    flex: 1,
  },

  activityTime: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#A15D43',
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#302A27',
  },

  activityArrow: {
    marginLeft: 10,
    fontSize: 27,
    fontWeight: '300',
    color: '#A49A95',
  },

  activityDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 9,
  },

  activityDetailIcon: {
    width: 23,
    fontSize: 13,
  },

  activityDetailText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#746C68',
  },

  activityNotes: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE7E3',
    fontSize: 13,
    lineHeight: 19,
    color: '#746C68',
  },

  longPressHint: {
    marginTop: 10,
    fontSize: 10,
    color: '#AAA09B',
  },

  emptyPeriod: {
    alignItems: 'center',
    paddingVertical: 17,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DED4CF',
    borderRadius: 15,
    backgroundColor: '#FFFCFA',
  },

  emptyPeriodText: {
    marginBottom: 4,
    fontSize: 13,
    color: '#8B817C',
  },

  emptyPeriodAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A15D43',
  },

  dayAddButton: {
    minHeight: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F7EAE4',
  },

  dayAddButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A15D43',
  },

  noDaysCard: {
    alignItems: 'center',
    padding: 30,
    borderWidth: 1,
    borderColor: '#E8DFDA',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },

  noDaysEmoji: {
    marginBottom: 15,
    fontSize: 42,
  },

  noDaysTitle: {
    marginBottom: 7,
    fontSize: 20,
    fontWeight: '800',
    color: '#292320',
  },

  noDaysDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#746C68',
  },

  floatingButtonContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 23,
    borderTopWidth: 1,
    borderTopColor: '#EEE5E0',
    backgroundColor: '#FFF9F6',
  },

  floatingButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#A15D43',
  },

  floatingButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  pressedCard: {
    opacity: 0.7,
  },

  pressedButton: {
    opacity: 0.72,
  },

  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 13,
    fontSize: 15,
    color: '#746C68',
  },

  notFoundEmoji: {
    marginBottom: 16,
    fontSize: 46,
  },

  notFoundTitle: {
    marginBottom: 8,
    fontSize: 23,
    fontWeight: '800',
    color: '#292320',
  },

  notFoundDescription: {
    maxWidth: 320,
    marginBottom: 23,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#746C68',
  },

  primaryButton: {
    minHeight: 51,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 17,
    backgroundColor: '#A15D43',
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});