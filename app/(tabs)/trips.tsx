import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  PressableStateCallbackType,
  RefreshControl,
  StyleSheet,
  StyleProp,
  Text,
  View,
  ViewStyle,
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

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTripStatus(trip: SavedTrip): string {
  const today = new Date();
  const startDate = new Date(`${trip.startDate}T00:00:00`);
  const endDate = new Date(`${trip.endDate}T23:59:59`);

  if (today < startDate) {
    return 'Upcoming';
  }

  if (today > endDate) {
    return 'Completed';
  }

  return 'In progress';
}

export default function TripsScreen() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      const storedTrips = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);

      if (!storedTrips) {
        setTrips([]);
        return;
      }

      const parsedTrips: SavedTrip[] = JSON.parse(storedTrips);

      setTrips(Array.isArray(parsedTrips) ? parsedTrips : []);
    } catch (error) {
      console.error('Unable to load trips:', error);

      Alert.alert(
        'Unable to load trips',
        'Your saved trips could not be loaded.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  const refreshTrips = () => {
    setIsRefreshing(true);
    loadTrips();
  };

  const openTrip = (tripId: string) => {
    router.push({
      pathname: '/trip/[tripId]',
      params: {
        tripId,
      },
    });
  };

  const renderTrip = ({ item }: { item: SavedTrip }) => {
    const status = getTripStatus(item);
    const statusBadgeStyle =
      status === 'Completed'
        ? styles.completedBadge
        : status === 'In progress'
          ? styles.inProgressBadge
          : undefined;

    return (
      <Pressable
        onPress={() => openTrip(item.id)}
        style={({ pressed }) => [
          styles.tripCard,
          pressed && styles.pressedCard,
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.destinationIcon}>
            <Text style={styles.destinationEmoji}>✈️</Text>
          </View>

          <View style={styles.cardHeading}>
            <Text style={styles.tripName} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={styles.destination} numberOfLines={1}>
              {item.destination}
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottomRow}>
          <View>
            <Text style={styles.detailLabel}>DATES</Text>

            <Text style={styles.detailValue}>
              {formatDate(item.startDate)} – {formatDate(item.endDate)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              status === 'Completed' && styles.completedBadge,
              status === 'In progress' && styles.inProgressBadge,
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.travelersText}>
          {item.travelers} {item.travelers === 1 ? 'traveler' : 'travelers'}
        </Text>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR ADVENTURES</Text>

            <Text style={styles.title}>My trips</Text>
          </View>

          <Pressable
            onPress={() => router.push('/create-trip')}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </Pressable>
        </View>

        {trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🧳</Text>
            </View>

            <Text style={styles.emptyTitle}>No trips yet</Text>

            <Text style={styles.emptyDescription}>
              Create your first trip and FlightFits will help organize your
              plans, packing list, and travel outfits.
            </Text>

            <Pressable
              onPress={() => router.push('/create-trip')}
              style={({ pressed }) => [
                styles.createButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.createButtonText}>Create a trip</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={renderTrip}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshTrips}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F6',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 20,
  },

  eyebrow: {
    marginBottom: 5,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#A15D43',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#221E1C',
  },

  addButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#A15D43',
  },

  addButtonText: {
    marginTop: -2,
    fontSize: 27,
    fontWeight: '400',
    color: '#FFFFFF',
  },

  pressedButton: {
    opacity: 0.75,
  },

  listContent: {
    paddingBottom: 110,
    gap: 14,
  },

  tripCard: {
    padding: 17,
    borderWidth: 1,
    borderColor: '#E8DFDA',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  pressedCard: {
    opacity: 0.75,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  destinationIcon: {
    width: 47,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 15,
    backgroundColor: '#F7EAE4',
  },

  destinationEmoji: {
    fontSize: 22,
  },

  cardHeading: {
    flex: 1,
  },

  tripName: {
    marginBottom: 3,
    fontSize: 18,
    fontWeight: '800',
    color: '#221E1C',
  },

  destination: {
    fontSize: 14,
    color: '#746C68',
  },

  arrow: {
    marginLeft: 10,
    fontSize: 32,
    fontWeight: '300',
    color: '#A09792',
  },

  divider: {
    height: 1,
    marginVertical: 15,
    backgroundColor: '#EEE7E3',
  },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailLabel: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#968C87',
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '650',
    color: '#413A36',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F5E5DC',
  },

  inProgressBadge: {
    backgroundColor: '#E4F2E8',
  },

  completedBadge: {
    backgroundColor: '#ECE9E7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#654C40',
  },

  travelersText: {
    marginTop: 12,
    fontSize: 12,
    color: '#817873',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 80,
  },

  emptyIconContainer: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    borderRadius: 46,
    backgroundColor: '#F7EAE4',
  },

  emptyIcon: {
    fontSize: 43,
  },

  emptyTitle: {
    marginBottom: 9,
    fontSize: 24,
    fontWeight: '800',
    color: '#221E1C',
  },

  emptyDescription: {
    maxWidth: 330,
    marginBottom: 25,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    color: '#746C68',
  },

  createButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    borderRadius: 17,
    backgroundColor: '#A15D43',
  },

  createButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#746C68',
  },
});