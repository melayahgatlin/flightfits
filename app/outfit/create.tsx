import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

import { getClosetItems } from "../../services/closetService";
import { createPlannedOutfit } from "../../services/outfitPlannerService";
import type { ClosetItem } from "../../types/closet";
import type { OutfitOccasion } from "../../types/outfitPlanner";

const OCCASIONS: OutfitOccasion[] = [
  "casual",
  "dinner",
  "nightlife",
  "beach",
  "work",
  "formal",
  "travel",
  "activity",
  "other",
];

export default function CreateOutfitScreen() {
  const params = useLocalSearchParams<{
    initialItemId?: string | string[];
    tripId?: string | string[];
  }>();

  const initialItemId = Array.isArray(params.initialItemId)
    ? params.initialItemId[0]
    : params.initialItemId;
  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialItemId ? [initialItemId] : []
  );
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [occasion, setOccasion] = useState<OutfitOccasion>("casual");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getClosetItems().then((items) => {
      setCloset(items);
      setLoading(false);
    });
  }, []);

  const selectedItems = useMemo(
    () => selectedIds
      .map((id) => closet.find((item) => item.id === id))
      .filter((item): item is ClosetItem => Boolean(item)),
    [closet, selectedIds]
  );

  const toggleItem = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Name your outfit", "Enter an outfit name.");
      return;
    }

    if (!selectedIds.length) {
      Alert.alert("Choose pieces", "Select at least one closet item.");
      return;
    }

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert("Check the date", "Use YYYY-MM-DD format.");
      return;
    }

    try {
      setSaving(true);
      await createPlannedOutfit({
        tripId,
        name,
        date: date || undefined,
        occasion,
        closetItemIds: selectedIds,
        notes,
      });
      router.replace("/outfit" as never);
    } catch {
      Alert.alert("Unable to save outfit", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#A15D43" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>OUTFIT BUILDER</Text>
          <Text style={styles.title}>Create a look</Text>

          <View style={styles.preview}>
            {selectedItems.slice(0, 4).map((item) =>
              item.imageUri ? (
                <Image
                  key={item.id}
                  source={{ uri: item.imageUri }}
                  style={styles.previewImage}
                  contentFit="cover"
                />
              ) : (
                <View key={item.id} style={styles.previewPlaceholder}>
                  <Text>👕</Text>
                </View>
              )
            )}

            {!selectedItems.length ? (
              <View style={styles.previewEmpty}>
                <Text style={styles.previewEmoji}>✨</Text>
                <Text style={styles.previewText}>
                  Select closet pieces below
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.label}>Outfit name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Dinner in Paris"
            style={styles.input}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            style={styles.input}
          />

          <Text style={styles.label}>Occasion</Text>
          <View style={styles.chipWrap}>
            {OCCASIONS.map((value) => (
              <Pressable
                key={value}
                onPress={() => setOccasion(value)}
                style={[
                  styles.chip,
                  occasion === value && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    occasion === value && styles.chipTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.label}>Choose pieces</Text>
              <Text style={styles.selectionCount}>
                {selectedIds.length} selected
              </Text>
            </View>

            <Pressable onPress={() => router.push("/closet/add-item" as never)}>
              <Text style={styles.addClosetLink}>＋ Add closet item</Text>
            </Pressable>
          </View>

          {closet.length ? (
            <FlatList
              horizontal
              data={closet}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.closetRow}
              renderItem={({ item }) => {
                const selected = selectedIds.includes(item.id);

                return (
                  <Pressable
                    onPress={() => toggleItem(item.id)}
                    style={[
                      styles.closetCard,
                      selected && styles.closetCardSelected,
                    ]}
                  >
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.closetImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.closetImage, styles.placeholder]}>
                        <Text style={{ fontSize: 30 }}>👕</Text>
                      </View>
                    )}

                    <Text numberOfLines={1} style={styles.closetName}>
                      {item.name}
                    </Text>
                    <Text style={styles.closetMeta}>{item.category}</Text>

                    {selected ? (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              }}
            />
          ) : (
            <Pressable
              style={styles.noCloset}
              onPress={() => router.push("/closet/add-item" as never)}
            >
              <Text style={styles.noClosetText}>
                Add closet pieces before building an outfit.
              </Text>
            </Pressable>
          )}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Shoes to pack, jewelry, weather notes..."
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.notes]}
          />

          <Pressable
            disabled={saving}
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={() => void save()}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save outfit"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F6" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9F6",
  },
  content: { padding: 20, paddingBottom: 50 },
  eyebrow: {
    marginBottom: 5,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#A15D43",
  },
  title: {
    marginBottom: 18,
    fontSize: 29,
    fontWeight: "800",
    color: "#302A27",
  },
  preview: {
    overflow: "hidden",
    height: 260,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 22,
    backgroundColor: "#EFE7E2",
  },
  previewImage: { width: "50%", height: "50%" },
  previewPlaceholder: {
    width: "50%",
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7EAE4",
  },
  previewEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  previewEmoji: { marginBottom: 8, fontSize: 44 },
  previewText: { fontSize: 14, fontWeight: "700", color: "#817772" },
  label: {
    marginTop: 17,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "800",
    color: "#403936",
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0D6D1",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#302A27",
  },
  notes: { minHeight: 105 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0D6D1",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  chipActive: { borderColor: "#A15D43", backgroundColor: "#F7EAE4" },
  chipText: { fontSize: 12, fontWeight: "700", color: "#746C68" },
  chipTextActive: { color: "#A15D43" },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  selectionCount: { fontSize: 11, color: "#817772" },
  addClosetLink: { fontSize: 12, fontWeight: "800", color: "#A15D43" },
  closetRow: { gap: 10, paddingVertical: 10 },
  closetCard: {
    width: 125,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  closetCardSelected: { borderColor: "#A15D43" },
  closetImage: {
    width: "100%",
    aspectRatio: 0.85,
    borderRadius: 12,
    backgroundColor: "#EFE7E2",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  closetName: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: "800",
    color: "#302A27",
  },
  closetMeta: { marginTop: 2, fontSize: 10, color: "#817772" },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#A15D43",
  },
  checkText: { fontWeight: "900", color: "#FFFFFF" },
  noCloset: {
    padding: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D8CEC8",
    borderRadius: 16,
  },
  noClosetText: { textAlign: "center", color: "#817772" },
  saveButton: {
    minHeight: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    borderRadius: 18,
    backgroundColor: "#A15D43",
  },
  saveButtonText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
});
