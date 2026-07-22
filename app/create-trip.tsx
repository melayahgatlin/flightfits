import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivitySelector, {
  ActivityOption,
} from '@/components/forms/ActivitySelector';

const TRIPS_STORAGE_KEY = 'flightfits.trips';

const ACTIVITIES: ActivityOption[] = [
  {
    id: 'sightseeing',
    label: 'Sightseeing',
    emoji: '🏛️',
  },
  {
    id: 'food',
    label: 'Food',
    emoji: '🍜',
  },
  {
    id: 'nightlife',
    label: 'Nightlife',
    emoji: '🌙',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    emoji: '🛍️',
  },
  {
    id: 'beach',
    label: 'Beach',
    emoji: '🏖️',
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    emoji: '🌿',
  },
  {
    id: 'culture',
    label: 'Culture',
    emoji: '🎭',
  },
  {
    id: 'events',
    label: 'Events',
    emoji: '🎟️',
  },
];

const LUGGAGE_OPTIONS = [
  {
    id: 'personal-item',
    label: 'Personal item',
    emoji: '🎒',
  },
  {
    id: 'carry-on',
    label: 'Carry-on',
    emoji: '🧳',
  },
  {
    id: 'checked-bag',
    label: 'Checked bag',
    emoji: '🛄',
  },
];

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

function isValidDate(date: string): boolean {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T12:00:00`);

  return !Number.isNaN(parsedDate.getTime());
}

export default function CreateTripScreen() {
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [budget, setBudget] = useState('');
  const [luggageType, setLuggageType] = useState('carry-on');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(() => {
    return (
      destination.trim().length > 0 &&
      startDate.trim().length > 0 &&
      endDate.trim().length > 0 &&
      !isSaving
    );
  }, [destination, startDate, endDate, isSaving]);

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((currentActivities) => {
      if (currentActivities.includes(activityId)) {
        return currentActivities.filter((id) => id !== activityId);
      }

      return [...currentActivities, activityId];
    });
  };

  const validateForm = (): boolean => {
    if (!destination.trim()) {
      Alert.alert('Destination required', 'Enter where you are traveling.');
      return false;
    }

    if (!isValidDate(startDate)) {
      Alert.alert(
        'Invalid start date',
        'Enter the start date in YYYY-MM-DD format.'
      );
      return false;
    }

    if (!isValidDate(endDate)) {
      Alert.alert(
        'Invalid end date',
        'Enter the end date in YYYY-MM-DD format.'
      );
      return false;
    }

    const parsedStartDate = new Date(`${startDate}T12:00:00`);
    const parsedEndDate = new Date(`${endDate}T12:00:00`);

    if (parsedEndDate < parsedStartDate) {
      Alert.alert(
        'Check your dates',
        'Your end date cannot be before your start date.'
      );
      return false;
    }

    const travelerCount = Number(travelers);

    if (
      !Number.isInteger(travelerCount) ||
      travelerCount < 1 ||
      travelerCount > 50
    ) {
      Alert.alert(
        'Invalid traveler count',
        'Enter a number between 1 and 50.'
      );
      return false;
    }

    if (budget.trim()) {
      const budgetAmount = Number(budget);

      if (Number.isNaN(budgetAmount) || budgetAmount < 0) {
        Alert.alert('Invalid budget', 'Enter a valid budget amount.');
        return false;
      }
    }

    return true;
  };

  const saveTrip = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      const newTrip: SavedTrip = {
        id: `${Date.now()}`,
        name: tripName.trim() || `Trip to ${destination.trim()}`,
        destination: destination.trim(),
        startDate,
        endDate,
        travelers: Number(travelers),
        budget: budget.trim() ? Number(budget) : undefined,
        luggageType,
        activities: selectedActivities,
        createdAt: new Date().toISOString(),
      };

      const storedTrips = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
      const existingTrips: SavedTrip[] = storedTrips
        ? JSON.parse(storedTrips)
        : [];

      const updatedTrips = [newTrip, ...existingTrips];

      await AsyncStorage.setItem(
        TRIPS_STORAGE_KEY,
        JSON.stringify(updatedTrips)
      );

      Alert.alert(
        'Trip created',
        `${newTrip.name} was added to your trips.`,
        [
          {
            text: 'View trips',
            onPress: () => router.replace('/(tabs)/trips'),
          },
        ]
      );
    } catch (error) {
      console.error('Unable to save trip:', error);

      Alert.alert(
        'Unable to save trip',
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headingContainer}>
            <Text style={styles.eyebrow}>NEW ADVENTURE</Text>

            <Text style={styles.title}>Create your trip</Text>

            <Text style={styles.subtitle}>
              Tell FlightFits where you are going so we can help plan your
              itinerary, outfits, and packing list.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip details</Text>

            <Text style={styles.label}>Trip name</Text>

            <TextInput
              value={tripName}
              onChangeText={setTripName}
              placeholder="Graduation trip"
              placeholderTextColor="#938B87"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.helperText}>
              Optional. We will create a name from your destination if left
              blank.
            </Text>

            <Text style={styles.label}>Destination</Text>

            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Shanghai, China"
              placeholderTextColor="#938B87"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.label}>Start date</Text>

                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#938B87"
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>

              <View style={styles.dateField}>
                <Text style={styles.label}>End date</Text>

                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#938B87"
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.label}>Travelers</Text>

                <TextInput
                  value={travelers}
                  onChangeText={setTravelers}
                  placeholder="1"
                  placeholderTextColor="#938B87"
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.dateField}>
                <Text style={styles.label}>Budget</Text>

                <View style={styles.moneyInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>

                  <TextInput
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="Optional"
                    placeholderTextColor="#938B87"
                    style={styles.moneyInput}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Luggage</Text>

            <Text style={styles.sectionDescription}>
              Choose the main type of luggage you plan to bring.
            </Text>

            <View style={styles.optionContainer}>
              {LUGGAGE_OPTIONS.map((option) => {
                const isSelected = luggageType === option.id;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setLuggageType(option.id)}
                    style={({ pressed }) => [
                      styles.luggageOption,
                      isSelected && styles.selectedLuggageOption,
                      pressed && styles.pressedOption,
                    ]}
                  >
                    <Text style={styles.luggageEmoji}>{option.emoji}</Text>

                    <Text
                      style={[
                        styles.luggageLabel,
                        isSelected && styles.selectedLuggageLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What do you want to do?</Text>

            <Text style={styles.sectionDescription}>
              Select all activities that interest you.
            </Text>

            <ActivitySelector
              activities={ACTIVITIES}
              selected={selectedActivities}
              onToggle={toggleActivity}
            />
          </View>

          <Pressable
            disabled={!canSave}
            onPress={saveTrip}
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.disabledButton,
              pressed && canSave && styles.pressedButton,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Creating trip...' : 'Create trip'}
            </Text>
          </Pressable>

          <Pressable
            disabled={isSaving}
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F6',
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },

  headingContainer: {
    marginBottom: 28,
  },

  eyebrow: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#A15D43',
  },

  title: {
    marginBottom: 10,
    fontSize: 32,
    fontWeight: '800',
    color: '#221E1C',
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6D6561',
  },

  section: {
    marginBottom: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8DFDA',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    marginBottom: 6,
    fontSize: 20,
    fontWeight: '700',
    color: '#221E1C',
  },

  sectionDescription: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#746C68',
  },

  label: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#37312E',
  },

  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DCD3CE',
    borderRadius: 14,
    backgroundColor: '#FFFCFA',
    fontSize: 16,
    color: '#221E1C',
  },

  helperText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 17,
    color: '#8A817D',
  },

  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },

  dateField: {
    flex: 1,
  },

  moneyInputContainer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#DCD3CE',
    borderRadius: 14,
    backgroundColor: '#FFFCFA',
  },

  currencySymbol: {
    marginRight: 5,
    fontSize: 16,
    fontWeight: '700',
    color: '#4E4743',
  },

  moneyInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#221E1C',
  },

  optionContainer: {
    gap: 10,
  },

  luggageOption: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#DED5D0',
    borderRadius: 15,
    backgroundColor: '#FFFCFA',
  },

  selectedLuggageOption: {
    borderColor: '#2C2725',
    backgroundColor: '#2C2725',
  },

  pressedOption: {
    opacity: 0.75,
  },

  luggageEmoji: {
    marginRight: 10,
    fontSize: 21,
  },

  luggageLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#302B28',
  },

  selectedLuggageLabel: {
    color: '#FFFFFF',
  },

  saveButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#A15D43',
  },

  pressedButton: {
    opacity: 0.8,
  },

  disabledButton: {
    opacity: 0.45,
  },

  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 8,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#756C68',
  },
});