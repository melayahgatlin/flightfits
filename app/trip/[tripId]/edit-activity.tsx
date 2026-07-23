import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActivityForm, {
  type ActivityFormValues,
} from "./activity-form";
import {
  deleteActivity,
  getActivity,
  getItinerary,
  updateActivity,
} from "../../../services/itineraryService";
import type {
  ItineraryActivity,
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

export default function EditActivityScreen() {
  const params = useLocalSearchParams<{
    tripId?: string | string[];
    activityId?: string | string[];
  }>();

  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;
  const activityId = Array.isArray(params.activityId)
    ? params.activityId[0]
    : params.activityId;

  const [itinerary, setItinerary] =
    useState<TripItinerary | null>(null);
  const [activity, setActivity] =
    useState<ItineraryActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!tripId || !activityId) {
        setLoading(false);
        return;
      }

      const [savedItinerary, savedActivity] = await Promise.all([
        getItinerary(tripId),
        getActivity(tripId, activityId),
      ]);

      if (active) {
        setItinerary(savedItinerary);
        setActivity(savedActivity);
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [activityId, tripId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#A15D43" />
      </SafeAreaView>
    );
  }

  if (!tripId || !activityId || !itinerary || !activity) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Activity not found</Text>
        <Text style={styles.errorText}>
          This activity may have been deleted.
        </Text>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const initialValues: ActivityFormValues = {
    date: activity.date,
    period: activity.period,
    title: activity.title,
    startTime: activity.startTime ?? "",
    endTime: activity.endTime ?? "",
    location: activity.location ?? "",
    address: activity.address ?? "",
    cost:
      activity.cost !== undefined ? String(activity.cost) : "",
    reservationLink: activity.reservationLink ?? "",
    notes: activity.notes ?? "",
  };

  const save = async (values: ActivityFormValues) => {
    const validationError = validate(values);

    if (validationError) {
      Alert.alert("Check activity details", validationError);
      return;
    }

    try {
      setSaving(true);

      await updateActivity({
        tripId,
        activityId,
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
        "Unable to update activity",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete activity?",
      `Remove "${activity.title}" from your itinerary?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteActivity(tripId, activityId);
              router.back();
            } catch {
              Alert.alert("Unable to delete activity", "Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <ActivityForm
        heading="Edit activity"
        eyebrow="ITINERARY ITEM"
        itinerary={itinerary}
        initialValues={initialValues}
        submitLabel="Save changes"
        saving={saving}
        onSubmit={(values) => void save(values)}
        onCancel={() => router.back()}
      />

      <Pressable style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.deleteButtonText}>Delete activity</Text>
      </Pressable>
    </>
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
    marginBottom: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#746C68",
  },
  backButton: {
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#A15D43",
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  deleteButton: {
    position: "absolute",
    right: 20,
    bottom: 14,
    left: 20,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D46969",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#B94747",
  },
});
