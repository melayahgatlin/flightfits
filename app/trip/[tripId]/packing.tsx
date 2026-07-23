import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  addPackingItem,
  deletePackingItem,
  getOrCreatePackingList,
  regeneratePackingList,
  togglePackingItem,
} from "@/services/packingService";
import type {
  PackingCategory,
  PackingList,
  PackingTripInput,
} from "@/types/packing";

const TRIP_STORAGE_KEYS = [
  "flightfits.trips",
  "@flightfits:trips",
  "trips",
];

const CATEGORIES: Array<{
  id: PackingCategory;
  label: string;
  emoji: string;
}> = [
  { id: "documents", label: "Documents", emoji: "🪪" },
  { id: "clothing", label: "Clothing", emoji: "👕" },
  { id: "shoes", label: "Shoes", emoji: "👟" },
  { id: "toiletries", label: "Toiletries", emoji: "🧴" },
  { id: "technology", label: "Technology", emoji: "🔌" },
  { id: "accessories", label: "Accessories", emoji: "👜" },
  { id: "health", label: "Health", emoji: "💊" },
  { id: "miscellaneous", label: "Other", emoji: "🧳" },
];

function normalizeTrip(value: Record<string, unknown>): PackingTripInput {
  return {
    id: String(value.id ?? ""),
    tripName: String(value.tripName ?? value.name ?? "My Trip"),
    name: String(value.name ?? value.tripName ?? "My Trip"),
    destination: String(value.destination ?? "Unknown destination"),
    startDate: String(value.startDate ?? ""),
    endDate: String(value.endDate ?? ""),
    luggageType: String(value.luggageType ?? ""),
    luggage: Array.isArray(value.luggage)
      ? value.luggage.map(String)
      : String(value.luggage ?? ""),
    activities: Array.isArray(value.activities)
      ? value.activities.map(String)
      : [],
  };
}

async function loadTrip(tripId: string): Promise<PackingTripInput | null> {
  for (const key of TRIP_STORAGE_KEYS) {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const trips = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as any).trips)
          ? (parsed as any).trips
          : [];

      const match = trips.find(
        (trip: Record<string, unknown>) => String(trip.id) === tripId
      );

      if (match) return normalizeTrip(match);
    } catch {
      // Try the next known key.
    }
  }

  return null;
}

export default function PackingScreen() {
  const params = useLocalSearchParams<{ tripId?: string | string[] }>();
  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const [trip, setTrip] = useState<PackingTripInput | null>(null);
  const [list, setList] = useState<PackingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] =
    useState<PackingCategory>("clothing");

  const load = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const storedTrip = await loadTrip(tripId);

      const fallbackTrip: PackingTripInput = {
        id: tripId,
        tripName: "My Trip",
        destination: "Your destination",
        activities: [],
      };

      const resolvedTrip = storedTrip ?? fallbackTrip;
      const packingList = await getOrCreatePackingList(resolvedTrip);

      setTrip(resolvedTrip);
      setList(packingList);
    } catch (error) {
      console.error(error);
      Alert.alert("Unable to load packing list", "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const packedCount = useMemo(
    () => list?.items.filter((item) => item.packed).length ?? 0,
    [list]
  );

  const progress =
    list && list.items.length > 0 ? packedCount / list.items.length : 0;

  const grouped = useMemo(() => {
    return CATEGORIES.map((category) => ({
      ...category,
      items:
        list?.items.filter((item) => item.category === category.id) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [list]);

  async function toggle(itemId: string) {
    if (!tripId || saving) return;

    try {
      setSaving(true);
      setList(await togglePackingItem(tripId, itemId));
    } catch {
      Alert.alert("Unable to update item", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(itemId: string, itemName: string) {
    Alert.alert("Delete item?", itemName, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!tripId) return;

          try {
            setList(await deletePackingItem(tripId, itemId));
          } catch {
            Alert.alert("Unable to delete item", "Please try again.");
          }
        },
      },
    ]);
  }

  async function addItem() {
    if (!tripId || !newName.trim()) {
      Alert.alert("Item name required", "Enter an item to pack.");
      return;
    }

    try {
      setSaving(true);
      const updated = await addPackingItem(
        tripId,
        newName.trim(),
        newCategory
      );

      setList(updated);
      setNewName("");
      setNewCategory("clothing");
      setShowAdd(false);
    } catch {
      Alert.alert("Unable to add item", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmRegenerate() {
    if (!trip) return;

    Alert.alert(
      "Regenerate packing list?",
      "FlightFits will rebuild the suggested items and keep anything you added yourself.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          onPress: async () => {
            try {
              setSaving(true);
              setList(await regeneratePackingList(trip, true));
            } catch {
              Alert.alert("Unable to regenerate", "Please try again.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#A15D43" />
        <Text style={styles.loadingText}>Building your packing list...</Text>
      </SafeAreaView>
    );
  }

  if (!tripId || !list) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Packing list unavailable</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PACKING</Text>
          <Text style={styles.title}>
            {trip?.tripName ?? trip?.name ?? "My Trip"}
          </Text>
          <Text style={styles.destination}>
            {trip?.destination ?? "Your destination"}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {packedCount} of {list.items.length} packed
            </Text>
            <Text style={styles.percentText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => setShowAdd(true)}
          >
            <Text style={styles.secondaryButtonText}>＋ Add item</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={confirmRegenerate}
          >
            <Text style={styles.secondaryButtonText}>↻ Regenerate</Text>
          </Pressable>
        </View>

        {grouped.map((group) => (
          <View key={group.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>{group.emoji}</Text>
              <Text style={styles.sectionTitle}>{group.label}</Text>
              <Text style={styles.sectionCount}>{group.items.length}</Text>
            </View>

            {group.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => void toggle(item.id)}
                onLongPress={() => confirmDelete(item.id, item.name)}
                style={({ pressed }) => [
                  styles.itemRow,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.packed && styles.checkboxChecked,
                  ]}
                >
                  {item.packed ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : null}
                </View>

                <View style={styles.itemContent}>
                  <Text
                    style={[
                      styles.itemName,
                      item.packed && styles.itemNamePacked,
                    ]}
                  >
                    {item.quantity > 1
                      ? `${item.quantity} × ${item.name}`
                      : item.name}
                  </Text>

                  <View style={styles.badgeRow}>
                    {item.essential ? (
                      <Text style={styles.essentialBadge}>Essential</Text>
                    ) : null}
                    {item.source === "custom" ? (
                      <Text style={styles.customBadge}>Added by you</Text>
                    ) : null}
                  </View>
                </View>

                <Text style={styles.deleteHint}>⋯</Text>
              </Pressable>
            ))}
          </View>
        ))}

        <Text style={styles.tip}>
          Tap an item to mark it packed. Hold an item to delete it.
        </Text>
      </ScrollView>

      <Modal
        visible={showAdd}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdd(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add packing item</Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Example: Camera"
              placeholderTextColor="#A69B95"
              style={styles.input}
              autoFocus
            />

            <Text style={styles.modalLabel}>Category</Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setNewCategory(category.id)}
                  style={[
                    styles.categoryChip,
                    newCategory === category.id &&
                      styles.categoryChipSelected,
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      newCategory === category.id &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              disabled={saving}
              style={styles.primaryButton}
              onPress={() => void addItem()}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Adding..." : "Add item"}
              </Text>
            </Pressable>

            <Pressable
              disabled={saving}
              style={styles.cancelButton}
              onPress={() => setShowAdd(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9F6",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
    backgroundColor: "#FFF9F6",
  },
  loadingText: {
    fontSize: 14,
    color: "#756B66",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#332D2A",
  },
  content: {
    padding: 18,
    paddingBottom: 48,
  },
  hero: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#A15D43",
  },
  eyebrow: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#F8DDD1",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  destination: {
    marginTop: 5,
    fontSize: 14,
    color: "#F9EAE3",
  },
  progressTrack: {
    height: 10,
    marginTop: 22,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F9EAE3",
  },
  percentText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 16,
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DCCFC8",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8E4F39",
  },
  section: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8DFDA",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  sectionEmoji: {
    marginRight: 8,
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: "#332D2A",
  },
  sectionCount: {
    minWidth: 27,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#F4E8E2",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#9B573F",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
    borderTopWidth: 1,
    borderTopColor: "#F1EBE7",
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#C8BBB4",
    borderRadius: 8,
  },
  checkboxChecked: {
    borderColor: "#A15D43",
    backgroundColor: "#A15D43",
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  itemContent: {
    flex: 1,
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3A322E",
  },
  itemNamePacked: {
    color: "#9B918C",
    textDecorationLine: "line-through",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 5,
  },
  essentialBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#A15D43",
  },
  customBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6E6A88",
  },
  deleteHint: {
    paddingLeft: 10,
    fontSize: 20,
    color: "#B3A8A2",
  },
  tip: {
    marginTop: 3,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#918782",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(38, 31, 28, 0.45)",
  },
  modalCard: {
    maxHeight: "88%",
    padding: 22,
    paddingBottom: 32,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FFF9F6",
  },
  modalTitle: {
    marginBottom: 15,
    fontSize: 22,
    fontWeight: "900",
    color: "#332D2A",
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#DDD3CE",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#292320",
  },
  modalLabel: {
    marginTop: 18,
    marginBottom: 9,
    fontSize: 13,
    fontWeight: "900",
    color: "#4B423D",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E1D7D1",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  categoryChipSelected: {
    borderColor: "#A15D43",
    backgroundColor: "#F5E6DF",
  },
  categoryEmoji: {
    marginRight: 7,
    fontSize: 17,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#746A65",
  },
  categoryTextSelected: {
    color: "#8E4F39",
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: 17,
    backgroundColor: "#A15D43",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#746A65",
  },
  pressed: {
    opacity: 0.7,
  },
});