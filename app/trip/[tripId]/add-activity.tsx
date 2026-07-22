import { router, useLocalSearchParams } from 'expo-router';
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

import { addActivity } from '../../../services/itineraryService';
import { ItineraryTimePeriod } from '../../../types/itinerary';

const PERIOD_OPTIONS: Array<{
  id: ItineraryTimePeriod;
  label: string;
  emoji: string;
}> = [
  {
    id: 'morning',
    label: 'Morning',
    emoji: '☀️',
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    emoji: '🌤️',
  },
  {
    id: 'evening',
    label: 'Evening',
    emoji: '🌙',
  },
];

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function isValidTime(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AddActivityScreen() {
  const params = useLocalSearchParams<{
    tripId?: string | string[];
    date?: string | string[];
    period?: string | string[];
  }>();

  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const date = Array.isArray(params.date)
    ? params.date[0]
    : params.date;

  const initialPeriodValue = Array.isArray(params.period)
    ? params.period[0]
    : params.period;

  const initialPeriod: ItineraryTimePeriod =
    initialPeriodValue === 'afternoon' ||
    initialPeriodValue === 'evening'
      ? initialPeriodValue
      : 'morning';

  const [title, setTitle] = useState('');
  const [period, setPeriod] =
    useState<ItineraryTimePeriod>(initialPeriod);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [cost, setCost] = useState('');
  const [reservationLink, setReservationLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = useMemo(() => {
    return date ? formatDate(date) : 'Trip date unavailable';
  }, [date]);

  const saveActivity = async () => {
    if (!tripId || !date) {
      Alert.alert(
        'Missing trip information',
        'This activity cannot be saved because the trip or date is missing.'
      );

      return;
    }

    if (!title.trim()) {
      Alert.alert(
        'Activity name required',
        'Enter a name for this activity.'
      );

      return;
    }

    if (!isValidTime(startTime)) {
      Alert.alert(
        'Invalid start time',
        'Use 24-hour time in HH:MM format, such as 09:30 or 18:45.'
      );

      return;
    }

    if (!isValidTime(endTime)) {
      Alert.alert(
        'Invalid end time',
        'Use 24-hour time in HH:MM format, such as 11:00 or 21:30.'
      );

      return;
    }

    if (
      startTime.trim() &&
      endTime.trim() &&
      endTime.trim() <= startTime.trim()
    ) {
      Alert.alert(
        'Check the activity time',
        'The end time must be later than the start time.'
      );

      return;
    }

    if (!isValidUrl(reservationLink)) {
      Alert.alert(
        'Invalid reservation link',
        'Enter a complete link beginning with http:// or https://.'
      );

      return;
    }

    const parsedCost = cost.trim()
      ? Number(cost.replace(/[$,]/g, ''))
      : undefined;

    if (
      parsedCost !== undefined &&
      (Number.isNaN(parsedCost) || parsedCost < 0)
    ) {
      Alert.alert(
        'Invalid cost',
        'Enter a valid cost greater than or equal to zero.'
      );

      return;
    }

    try {
      setIsSaving(true);

      await addActivity({
        tripId,
        date,
        period,
        title: title.trim(),
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        location: location.trim() || undefined,
        address: address.trim() || undefined,
        cost: parsedCost,
        reservationLink:
          reservationLink.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch (error) {
      console.error('Unable to save activity:', error);

      Alert.alert(
        'Unable to save activity',
        error instanceof Error
          ? error.message
          : 'Please try again.'
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
          <View style={styles.headerCard}>
            <Text style={styles.eyebrow}>NEW ITINERARY ITEM</Text>

            <Text style={styles.title}>Add activity</Text>

            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Activity name *</Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Example: Visit the Louvre"
              placeholderTextColor="#AAA09B"
              style={styles.input}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Time of day</Text>

            <View style={styles.periodRow}>
              {PERIOD_OPTIONS.map((option) => {
                const selected = period === option.id;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setPeriod(option.id)}
                    style={({ pressed }) => [
                      styles.periodButton,
                      selected && styles.periodButtonSelected,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text style={styles.periodEmoji}>
                      {option.emoji}
                    </Text>

                    <Text
                      style={[
                        styles.periodText,
                        selected && styles.periodTextSelected,
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
            <Text style={styles.label}>Activity time</Text>

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.smallLabel}>START</Text>

                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:30"
                  placeholderTextColor="#AAA09B"
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>

              <View style={styles.timeSeparator}>
                <Text style={styles.timeSeparatorText}>to</Text>
              </View>

              <View style={styles.timeField}>
                <Text style={styles.smallLabel}>END</Text>

                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="11:00"
                  placeholderTextColor="#AAA09B"
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>

            <Text style={styles.helperText}>
              Use 24-hour time in HH:MM format.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>

            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Example: Louvre Museum"
              placeholderTextColor="#AAA09B"
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={[styles.label, styles.secondaryLabel]}>
              Address
            </Text>

            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Street address or neighborhood"
              placeholderTextColor="#AAA09B"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Estimated cost</Text>

            <TextInput
              value={cost}
              onChangeText={setCost}
              placeholder="0"
              placeholderTextColor="#AAA09B"
              style={styles.input}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Reservation link</Text>

            <TextInput
              value={reservationLink}
              onChangeText={setReservationLink}
              placeholder="https://..."
              placeholderTextColor="#AAA09B"
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Tickets, dress code, confirmation details, or anything else..."
              placeholderTextColor="#AAA09B"
              style={[styles.input, styles.notesInput]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable
            disabled={isSaving}
            onPress={saveActivity}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressedButton,
              isSaving && styles.disabledButton,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving activity...' : 'Save activity'}
            </Text>
          </Pressable>

          <Pressable
            disabled={isSaving}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.pressedButton,
            ]}
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
    padding: 20,
    paddingBottom: 45,
  },

  headerCard: {
    marginBottom: 20,
    padding: 22,
    borderRadius: 22,
    backgroundColor: '#A15D43',
  },

  eyebrow: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#F8DDD1',
  },

  title: {
    marginBottom: 7,
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  dateText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#F8E9E2',
  },

  section: {
    marginBottom: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E8DFDA',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
  },

  label: {
    marginBottom: 9,
    fontSize: 14,
    fontWeight: '800',
    color: '#332D2A',
  },

  secondaryLabel: {
    marginTop: 16,
  },

  smallLabel: {
    marginBottom: 6,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#8F8580',
  },

  input: {
    minHeight: 49,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DDD3CE',
    borderRadius: 14,
    backgroundColor: '#FFFCFA',
    fontSize: 15,
    color: '#292320',
  },

  notesInput: {
    minHeight: 120,
  },

  periodRow: {
    flexDirection: 'row',
    gap: 9,
  },

  periodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 84,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E1D8D3',
    borderRadius: 15,
    backgroundColor: '#FFFCFA',
  },

  periodButtonSelected: {
    borderColor: '#A15D43',
    backgroundColor: '#F7EAE4',
  },

  periodEmoji: {
    marginBottom: 7,
    fontSize: 21,
  },

  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#746C68',
  },

  periodTextSelected: {
    color: '#A15D43',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  timeField: {
    flex: 1,
  },

  timeSeparator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    paddingBottom: 15,
  },

  timeSeparatorText: {
    fontSize: 13,
    color: '#8F8580',
  },

  helperText: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    color: '#918782',
  },

  saveButton: {
    minHeight: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    borderRadius: 18,
    backgroundColor: '#A15D43',
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  cancelButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderRadius: 17,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#746C68',
  },

  pressedButton: {
    opacity: 0.72,
  },

  disabledButton: {
    opacity: 0.55,
  },
});