import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActivityForm, {
  type ActivityFormValues,
} from "./activity-form";
import {
  addActivity,
  getItinerary,
} from "../../../services/itineraryService";
import type {
  ItineraryTimePeriod,
  TripItinerary,
} from "../../../types/itinerary";

function isValidTime(value: string): boolean {
  return !value.trim() ||
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(values: ActivityFormValues): string | null {
  if (!values.title.trim()) {
    return "Enter an activity name.";
  }

  if (!isValidTime(values.startTime)) {
    return "Enter the start time in HH:MM format.";
  }

  if (!isValidTime(values.endTime)) {
    return "Enter the end time in HH:MM format.";
  }

  if (
    values.startTime.trim() &&
    values.endTime.trim() &&
    values.endTime <= values.startTime
  ) {
    return "The end time must be later than the start time.";
  }

  if (!isValidUrl(values.reservationLink)) {
    return "Enter a complete reservation link beginning with http:// or https://.";
  }

  const parsedCost = values.cost.trim()
    ? Number(values.cost.replace(/[$,]/g, ""))
    : undefined;

  if (
    parsedCost !== undefined &&
    (Number.isNaN(parsedCost) || parsedCost < 0)
  ) {
    return "Enter a valid cost greater than or equal to zero.";
  }

  return null;
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
  const periodValue = Array.isArray(params.period)
    ? params.period[0]
    : params.period;

  const initialPeriod: ItineraryTimePeriod =
    periodValue === "afternoon" || periodValue === "evening"
      ? periodValue
      : "morning";

  const [itinerary, setItinerary] =
    useState<TripItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!tripId) {
        setLoading(false);
        return;
      }

      const result = await getItinerary(tripId);

      if (active) {
        setItinerary(result);
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [tripId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#A15D43" />
      </SafeAreaView>
    );
  }

  if (!tripId || !date || !itinerary) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Activity unavailable</Text>
        <Text style={styles.errorText}>
          Return to the itinerary and try again.
        </Text>
      </SafeAreaView>
    );
  }

  const initialValues: ActivityFormValues = {
    date,
    period: initialPeriod,
    title: "",
    startTime: "",
    endTime: "",
    location: "",
    address: "",
    cost: "",
    reservationLink: "",
    notes: "",
  };

  const save = async (values: ActivityFormValues) => {
    const validationError = validate(values);

    if (validationError) {
      Alert.alert("Check activity details", validationError);
      return;
    }

    try {
      setSaving(true);

      await addActivity({
        tripId,
        date: values.date,
        period: values.period,
        title: values.title.trim(),
        startTime: values.startTime.trim() || undefined,
        endTime: values.endTime.trim() || undefined,
        location: values.location.trim() || undefined,
        address: values.address.trim() || undefined,
        cost: values.cost.trim()
          ? Number(values.cost.replace(/[$,]/g, ""))
          : undefined,
        reservationLink:
          values.reservationLink.trim() || undefined,
        notes: values.notes.trim() || undefined,
      });

      router.back();
    } catch (error) {
      Alert.alert(
        "Unable to save activity",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ActivityForm
      heading="Add activity"
      eyebrow="NEW ITINERARY ITEM"
      itinerary={itinerary}
      initialValues={initialValues}
      submitLabel="Save activity"
      saving={saving}
      onSubmit={(values) => void save(values)}
      onCancel={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFF9F6",
  },
  errorTitle: {
    marginBottom: 7,
    fontSize: 22,
    fontWeight: "800",
    color: "#332D2A",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    color: "#746C68",
  },
});
