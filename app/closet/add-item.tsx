import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createClosetItem } from "../../services/closetService";
import type {
  ClosetCategory,
  ClosetSeason,
} from "../../types/closet";

const CATEGORIES: ClosetCategory[] = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "bags",
  "accessories",
  "swimwear",
  "other",
];

const SEASONS: ClosetSeason[] = [
  "spring",
  "summer",
  "fall",
  "winter",
  "all-season",
];

export default function AddClosetItemScreen() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClosetCategory>("tops");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [imageUri, setImageUri] = useState<string>();
  const [seasons, setSeasons] = useState<ClosetSeason[]>(["all-season"]);
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo permission needed",
        "Allow photo access to add clothing images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });

    const selectedImage = result.assets?.[0];

    if (!result.canceled && selectedImage) {
      setImageUri(selectedImage.uri);
    }
  };

  const toggleSeason = (season: ClosetSeason) => {
    setSeasons((current) =>
      current.includes(season)
        ? current.filter((item) => item !== season)
        : [...current, season]
    );
  };

  const save = async () => {
    if (!name.trim() || !color.trim()) {
      Alert.alert("Missing details", "Enter an item name and color.");
      return;
    }

    try {
      setSaving(true);
      await createClosetItem({
        name,
        category,
        color,
        brand,
        imageUri,
        seasons,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes,
      });
      router.back();
    } catch {
      Alert.alert("Unable to save item", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.eyebrow}>NEW CLOSET PIECE</Text>
          <Text style={styles.title}>Add item</Text>

          <Pressable style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                contentFit="cover"
              />
            ) : (
              <>
                <Text style={styles.cameraEmoji}>📸</Text>
                <Text style={styles.imagePickerTitle}>Add a photo</Text>
                <Text style={styles.imagePickerText}>
                  Choose a clear picture of the item
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.label}>Item name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="White linen shirt"
            style={styles.input}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((value) => (
              <Pressable
                key={value}
                onPress={() => setCategory(value)}
                style={[
                  styles.chip,
                  category === value && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === value && styles.chipTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Color *</Text>
          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder="Cream"
            style={styles.input}
          />

          <Text style={styles.label}>Brand</Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="Optional"
            style={styles.input}
          />

          <Text style={styles.label}>Seasons</Text>
          <View style={styles.chipWrap}>
            {SEASONS.map((value) => (
              <Pressable
                key={value}
                onPress={() => toggleSeason(value)}
                style={[
                  styles.chip,
                  seasons.includes(value) && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    seasons.includes(value) && styles.chipTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Tags</Text>
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="vacation, neutral, dinner"
            style={styles.input}
          />
          <Text style={styles.helper}>Separate tags with commas.</Text>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Sizing, styling ideas, care instructions..."
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
              {saving ? "Saving..." : "Save to closet"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9F6" },
  content: { padding: 20, paddingBottom: 45 },
  eyebrow: {
    marginBottom: 5,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#A15D43",
  },
  title: {
    marginBottom: 20,
    fontSize: 30,
    fontWeight: "800",
    color: "#302A27",
  },
  imagePicker: {
    overflow: "hidden",
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D5CAC4",
    borderRadius: 22,
    backgroundColor: "#F7EAE4",
  },
  preview: { width: "100%", height: "100%" },
  cameraEmoji: { marginBottom: 9, fontSize: 38 },
  imagePickerTitle: { fontSize: 16, fontWeight: "800", color: "#302A27" },
  imagePickerText: { marginTop: 5, fontSize: 12, color: "#817772" },
  label: {
    marginTop: 15,
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
  notes: { minHeight: 110 },
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
  helper: { marginTop: 6, fontSize: 11, color: "#918782" },
  saveButton: {
    minHeight: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    borderRadius: 18,
    backgroundColor: "#A15D43",
  },
  saveButtonText: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
});