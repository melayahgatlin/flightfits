import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PackingItemRow } from "@/components/cards/PackingItemRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { generatePackingList } from "@/services/packingService";
import type { LuggageType, TripDraft } from "@/types/trip";

export default function PackingListScreen() {
  const params = useLocalSearchParams<{
    tripName?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    luggageType?: string;
    activities?: string;
  }>();

  const trip: TripDraft = useMemo(
    () => ({
      tripName: params.tripName ?? "My Trip",
      destination: params.destination ?? "Unknown destination",
      startDate: params.startDate ?? "",
      endDate: params.endDate ?? "",
      luggageType: (params.luggageType as LuggageType) ?? "carry-on",
      activities: parseActivities(params.activities),
    }),
    [params]
  );

  const [items, setItems] = useState(() => generatePackingList(trip));
  const packedCount = items.filter((item) => item.packed).length;
  const progress = items.length === 0 ? 0 : packedCount / items.length;

  function toggleItem(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tripName}>{trip.tripName}</Text>
        <Text style={styles.destination}>{trip.destination}</Text>
        <ProgressBar progress={progress} />
        <Text style={styles.progressText}>
          {packedCount} of {items.length} items packed
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PackingItemRow
            item={item}
            onToggle={() => toggleItem(item.id)}
            onDelete={() => deleteItem(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No items left in this packing list.</Text>
        }
      />

      <View style={styles.footer}>
        <PrimaryButton
          label="Save trip"
          onPress={() =>
            Alert.alert(
              "Starter mode",
              "Supabase saving will be connected in a later step."
            )
          }
        />
      </View>
    </View>
  );
}

function parseActivities(value?: string): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  tripName: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  destination: {
    color: Colors.textMuted,
    fontSize: 15,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  empty: {
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 50,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
