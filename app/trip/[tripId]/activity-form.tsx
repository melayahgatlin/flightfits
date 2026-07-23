import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  ItineraryTimePeriod,
  TripItinerary,
} from "../../../types/itinerary";

export type ActivityFormValues = {
  date: string;
  period: ItineraryTimePeriod;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  cost: string;
  reservationLink: string;
  notes: string;
};

type Props = {
  heading: string;
  eyebrow: string;
  itinerary: TripItinerary;
  initialValues: ActivityFormValues;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: ActivityFormValues) => void;
  onCancel: () => void;
};

const PERIODS: Array<{
  id: ItineraryTimePeriod;
  label: string;
  emoji: string;
}> = [
  { id: "morning", label: "Morning", emoji: "☀️" },
  { id: "afternoon", label: "Afternoon", emoji: "🌤️" },
  { id: "evening", label: "Evening", emoji: "🌙" },
];

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ActivityForm({
  heading,
  eyebrow,
  itinerary,
  initialValues,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] =
    useState<ActivityFormValues>(initialValues);

  const update = <K extends keyof ActivityFormValues>(
    key: K,
    value: ActivityFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCard}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{heading}</Text>
            <Text style={styles.dateText}>
              {formatDate(values.date)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Trip day</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayRow}
            >
              {itinerary.days.map((day) => {
                const selected = day.date === values.date;

                return (
                  <Pressable
                    key={day.id}
                    onPress={() => update("date", day.date)}
                    style={[
                      styles.dayChip,
                      selected && styles.dayChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipNumber,
                        selected && styles.dayChipTextSelected,
                      ]}
                    >
                      Day {day.dayNumber}
                    </Text>
                    <Text
                      style={[
                        styles.dayChipDate,
                        selected && styles.dayChipTextSelected,
                      ]}
                    >
                      {formatDate(day.date)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Activity name *</Text>
            <TextInput
              value={values.title}
              onChangeText={(value) => update("title", value)}
              placeholder="Example: Visit the Louvre"
              placeholderTextColor="#AAA09B"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Time of day</Text>
            <View style={styles.periodRow}>
              {PERIODS.map((option) => {
                const selected = values.period === option.id;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => update("period", option.id)}
                    style={[
                      styles.periodButton,
                      selected && styles.periodButtonSelected,
                    ]}
                  >
                    <Text style={styles.periodEmoji}>{option.emoji}</Text>
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
                  value={values.startTime}
                  onChangeText={(value) => update("startTime", value)}
                  placeholder="09:30"
                  placeholderTextColor="#AAA09B"
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>

              <Text style={styles.timeSeparator}>to</Text>

              <View style={styles.timeField}>
                <Text style={styles.smallLabel}>END</Text>
                <TextInput
                  value={values.endTime}
                  onChangeText={(value) => update("endTime", value)}
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
              value={values.location}
              onChangeText={(value) => update("location", value)}
              placeholder="Example: Louvre Museum"
              placeholderTextColor="#AAA09B"
              style={styles.input}
            />

            <Text style={[styles.label, styles.secondaryLabel]}>
              Address
            </Text>
            <TextInput
              value={values.address}
              onChangeText={(value) => update("address", value)}
              placeholder="Street address or neighborhood"
              placeholderTextColor="#AAA09B"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Estimated cost</Text>
            <TextInput
              value={values.cost}
              onChangeText={(value) => update("cost", value)}
              placeholder="0"
              placeholderTextColor="#AAA09B"
              style={styles.input}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Reservation link</Text>
            <TextInput
              value={values.reservationLink}
              onChangeText={(value) => update("reservationLink", value)}
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
              value={values.notes}
              onChangeText={(value) => update("notes", value)}
              placeholder="Tickets, dress code, confirmation details..."
              placeholderTextColor="#AAA09B"
              style={[styles.input, styles.notesInput]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Pressable
            disabled={saving}
            onPress={() => onSubmit(values)}
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : submitLabel}
            </Text>
          </Pressable>

          <Pressable
            disabled={saving}
            onPress={onCancel}
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
  safeArea: { flex: 1, backgroundColor: "#FFF9F6" },
  keyboardView: { flex: 1 },
  content: { padding: 20, paddingBottom: 45 },
  headerCard: {
    marginBottom: 20,
    padding: 22,
    borderRadius: 22,
    backgroundColor: "#A15D43",
  },
  eyebrow: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#F8DDD1",
  },
  title: {
    marginBottom: 7,
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  dateText: { fontSize: 14, color: "#F8E9E2" },
  section: {
    marginBottom: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E8DFDA",
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
  },
  label: {
    marginBottom: 9,
    fontSize: 14,
    fontWeight: "800",
    color: "#332D2A",
  },
  secondaryLabel: { marginTop: 16 },
  smallLabel: {
    marginBottom: 6,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#8F8580",
  },
  input: {
    minHeight: 49,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#DDD3CE",
    borderRadius: 14,
    backgroundColor: "#FFFCFA",
    fontSize: 15,
    color: "#292320",
  },
  notesInput: { minHeight: 120 },
  dayRow: { gap: 8 },
  dayChip: {
    minWidth: 106,
    padding: 11,
    borderWidth: 1,
    borderColor: "#E1D8D3",
    borderRadius: 14,
    backgroundColor: "#FFFCFA",
  },
  dayChipSelected: {
    borderColor: "#A15D43",
    backgroundColor: "#F7EAE4",
  },
  dayChipNumber: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#544A45",
  },
  dayChipDate: { fontSize: 10, color: "#817772" },
  dayChipTextSelected: { color: "#A15D43" },
  periodRow: { flexDirection: "row", gap: 9 },
  periodButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 84,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E1D8D3",
    borderRadius: 15,
    backgroundColor: "#FFFCFA",
  },
  periodButtonSelected: {
    borderColor: "#A15D43",
    backgroundColor: "#F7EAE4",
  },
  periodEmoji: { marginBottom: 7, fontSize: 21 },
  periodText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#746C68",
  },
  periodTextSelected: { color: "#A15D43" },
  timeRow: { flexDirection: "row", alignItems: "flex-end" },
  timeField: { flex: 1 },
  timeSeparator: {
    width: 36,
    paddingBottom: 16,
    textAlign: "center",
    fontSize: 13,
    color: "#8F8580",
  },
  helperText: {
    marginTop: 8,
    fontSize: 11,
    color: "#918782",
  },
  saveButton: {
    minHeight: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#A15D43",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cancelButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#746C68",
  },
  disabledButton: { opacity: 0.55 },
});
