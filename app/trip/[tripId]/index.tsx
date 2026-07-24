import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
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

const ACTIVITY_DETAILS: Record<
  string,
  {
    label: string;
    emoji: string;
  }
> = {
  sightseeing: {
    label: 'Sightseeing',
    emoji: '🏛️',
  },
  food: {
    label: 'Food',
    emoji: '🍜',
  },
  nightlife: {
    label: 'Nightlife',
    emoji: '🌙',
  },
  shopping: {
    label: 'Shopping',
    emoji: '🛍️',
  },
  beach: {
    label: 'Beach',
    emoji: '🏖️',
  },
  outdoors: {
    label: 'Outdoors',
    emoji: '🌿',
  },
  culture: {
    label: 'Culture',
    emoji: '🎭',
  },
  events: {
    label: 'Events',
    emoji: '🎟️',
  },
};

const LUGGAGE_DETAILS: Record<
  string,
  {
    label: string;
    emoji: string;
  }
> = {
  'personal-item': {
    label: 'Personal item',
    emoji: '🎒',
  },
  'carry-on': {
    label: 'Carry-on',
    emoji: '🧳',
  },
  'checked-bag': {
    label: 'Checked bag',
    emoji: '🛄',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateTripLength(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  const difference = end.getTime() - start.getTime();

  return Math.floor(difference / 86_400_000) + 1;
}

export default function TripDetailsScreen() {
  const params = useLocalSearchParams<{
    tripId?: string | string[];
  }>();

  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrip = useCallback(async () => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    try {
      const storedTrips = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
      const trips: SavedTrip[] = storedTrips
        ? JSON.parse(storedTrips)
        : [];

      const matchingTrip = trips.find((item) => item.id === tripId);

      setTrip(matchingTrip ?? null);
    } catch (error) {
      console.error('Unable to load trip:', error);

      Alert.alert(
        'Unable to load trip',
        'The trip details could not be loaded.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadTrip();
    }, [loadTrip])
  );

  const deleteTrip = () => {
    if (!trip) {
      return;
    }

    Alert.alert(
      'Delete trip?',
      `This will permanently remove "${trip.name}" from your saved trips.`,
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
              const storedTrips = await AsyncStorage.getItem(
                TRIPS_STORAGE_KEY
              );

              const trips: SavedTrip[] = storedTrips
                ? JSON.parse(storedTrips)
                : [];

              const remainingTrips = trips.filter(
                (item) => item.id !== trip.id
              );

              await AsyncStorage.setItem(
                TRIPS_STORAGE_KEY,
                JSON.stringify(remainingTrips)
              );

              router.replace('/(tabs)/trips');
            } catch (error) {
              console.error('Unable to delete trip:', error);

              Alert.alert(
                'Unable to delete trip',
                'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Text style={styles.notFoundEmoji}>🧭</Text>

          <Text style={styles.notFoundTitle}>Trip not found</Text>

          <Text style={styles.notFoundDescription}>
            This trip may have been deleted or is no longer available.
          </Text>

          <Pressable
            onPress={() => router.replace('/(tabs)/trips')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>Back to trips</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tripLength = calculateTripLength(
    trip.startDate,
    trip.endDate
  );

  const luggage =
    LUGGAGE_DETAILS[trip.luggageType] ??
    LUGGAGE_DETAILS['carry-on'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>✈️</Text>

          <Text style={styles.tripName}>{trip.name}</Text>

          <Text style={styles.destination}>{trip.destination}</Text>

          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>
              {tripLength} {tripLength === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailEmoji}>📅</Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Start date</Text>

              <Text style={styles.detailValue}>
                {formatDate(trip.startDate)}
              </Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailEmoji}>🏁</Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>End date</Text>

              <Text style={styles.detailValue}>
                {formatDate(trip.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailEmoji}>👥</Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Travelers</Text>

              <Text style={styles.detailValue}>
                {trip.travelers}{' '}
                {trip.travelers === 1 ? 'traveler' : 'travelers'}
              </Text>
            </View>
          </View>

          {trip.budget !== undefined && (
            <>
              <View style={styles.rowDivider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailEmoji}>💰</Text>
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Budget</Text>

                  <Text style={styles.detailValue}>
                    $
                    {trip.budget.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Luggage</Text>

          <View style={styles.luggageCard}>
            <Text style={styles.luggageEmoji}>{luggage?.emoji ?? '🧳'}</Text>

            <View>
              <Text style={styles.luggageLabel}>
                {luggage?.label ?? 'Not selected'}
              </Text>

              <Text style={styles.luggageDescription}>
                Your primary luggage selection
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip interests</Text>

          {trip.activities.length > 0 ? (
            <View style={styles.activityContainer}>
              {trip.activities.map((activityId) => {
                const activity = ACTIVITY_DETAILS[activityId];

                if (!activity) {
                  return null;
                }

                return (
                  <View
                    key={activityId}
                    style={styles.activityChip}
                  >
                    <Text style={styles.activityText}>
                      {activity.emoji} {activity.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyActivities}>
              No interests were selected for this trip.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan your trip</Text>

          <View style={styles.featureGrid}>
            <Pressable
              onPress={() => router.push(`/trip/${trip.id}/itinerary`)}
              style={({ pressed }) => [
                styles.featureCard,
                pressed && styles.pressedCard,
              ]}
          >
              <Text style={styles.featureEmoji}>🗓️</Text>
              <Text style={styles.featureTitle}>Itinerary</Text>
              <Text style={styles.featureDescription}>
                Organize each day
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push(`/trip/${trip.id}/packing`)}
              style={({ pressed }) => [
                styles.featureCard,
                pressed && styles.pressedCard,
              ]}
            >
              <Text style={styles.featureEmoji}>🧳</Text>
              <Text style={styles.featureTitle}>Packing</Text>
              <Text style={styles.featureDescription}>
                Build your packing list
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/outfits/create' as never,
                  params: { tripId: trip.id },
                })
              }
              style={({ pressed }) => [
                styles.featureCard,
                pressed && styles.pressedCard,
              ]}
            >
              <Text style={styles.featureEmoji}>👗</Text>
              <Text style={styles.featureTitle}>Outfits</Text>
              <Text style={styles.featureDescription}>
                Plan travel looks
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Coming soon',
                  'Local event discovery will be added soon.'
                )
              }
              style={({ pressed }) => [
                styles.featureCard,
                pressed && styles.pressedCard,
              ]}
            >
              <Text style={styles.featureEmoji}>🎟️</Text>
              <Text style={styles.featureTitle}>Explore</Text>
              <Text style={styles.featureDescription}>
                Find events and places
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={deleteTrip}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.deleteButtonText}>Delete trip</Text>
        </Pressable>
      </ScrollView>
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
    paddingBottom: 50,
  },

  heroCard: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 25,
    backgroundColor: '#A15D43',
  },

  heroEmoji: {
    marginBottom: 13,
    fontSize: 42,
  },

  tripName: {
    marginBottom: 7,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
  },

  destination: {
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#F8E9E2',
  },

  dateBadge: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  dateBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  section: {
    marginBottom: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8DFDA',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '800',
    color: '#221E1C',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#F9EFEB',
  },

  detailEmoji: {
    fontSize: 20,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    marginBottom: 3,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#918782',
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#332D2A',
  },

  rowDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#EEE7E3',
  },

  luggageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#FFF8F4',
  },

  luggageEmoji: {
    marginRight: 13,
    fontSize: 32,
  },

  luggageLabel: {
    marginBottom: 3,
    fontSize: 16,
    fontWeight: '800',
    color: '#332D2A',
  },

  luggageDescription: {
    fontSize: 13,
    color: '#817772',
  },

  activityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  activityChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F7EAE4',
  },

  activityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#604A40',
  },

  emptyActivities: {
    fontSize: 14,
    lineHeight: 21,
    color: '#817772',
  },

  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
  },

  featureCard: {
    width: '48%',
    minHeight: 135,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8DFDA',
    borderRadius: 17,
    backgroundColor: '#FFFCFA',
  },

  pressedCard: {
    opacity: 0.7,
  },

  featureEmoji: {
    marginBottom: 12,
    fontSize: 25,
  },

  featureTitle: {
    marginBottom: 4,
    fontSize: 15,
    fontWeight: '800',
    color: '#332D2A',
  },

  featureDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#817772',
  },

  deleteButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D46969',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },

  deleteButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B94747',
  },

  pressedButton: {
    opacity: 0.7,
  },

  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#746C68',
  },

  notFoundEmoji: {
    marginBottom: 17,
    fontSize: 48,
  },

  notFoundTitle: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '800',
    color: '#221E1C',
  },

  notFoundDescription: {
    maxWidth: 320,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#746C68',
  },

  primaryButton: {
    minHeight: 51,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 23,
    borderRadius: 17,
    backgroundColor: '#A15D43',
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
})