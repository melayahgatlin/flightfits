import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteClosetItem,
  getClosetItem,
  toggleClosetFavorite,
} from "../../services/closetService";
import type { ClosetItem } from "../../types/closet";

export default function ClosetItemDetailsScreen() {
  const params = useLocalSearchParams<{ itemId?: string | string[] }>();
  const itemId = Array.isArray(params.itemId)
    ? params.itemId[0]
    : params.itemId;

  const [item, setItem] = useState<ClosetItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setItem(await getClosetItem(itemId));
    setLoading(false);
  }, [itemId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#A15D43" />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Item not found</Text>
      </SafeAreaView>
    );
  }

  const remove = () => {
    Alert.alert("Delete item?", "This will remove it from your closet.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteClosetItem(item.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderEmoji}>👕</Text>
          </View>
        )}

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{item.category.toUpperCase()}</Text>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.color}
              {item.brand ? ` • ${item.brand}` : ""}
            </Text>
          </View>

          <Pressable
            style={styles.favorite}
            onPress={async () => {
              await toggleClosetFavorite(item.id);
              await load();
            }}
          >
            <Text style={styles.favoriteText}>
              {item.favorite ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seasons</Text>
          <View style={styles.tags}>
            {item.seasons.map((season) => (
              <Text key={season} style={styles.tag}>
                {season}
              </Text>
            ))}
          </View>
        </View>

        {item.tags.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {item.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {item.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.useButton}
          onPress={() =>
            router.push({
              pathname: "/outfits/create" as never,
              params: { initialItemId: item.id },
            })
          }
        >
          <Text style={styles.useButtonText}>Build an outfit with this</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={remove}>
          <Text style={styles.deleteButtonText}>Delete item</Text>
        </Pressable>
      </ScrollView>
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
  image: {
    width: "100%",
    aspectRatio: 0.92,
    borderRadius: 24,
    backgroundColor: "#EFE7E2",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  placeholderEmoji: { fontSize: 70 },
  titleRow: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  eyebrow: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#A15D43",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#302A27" },
  meta: { marginTop: 5, fontSize: 14, color: "#817772" },
  favorite: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F7EAE4",
  },
  favoriteText: { fontSize: 28, color: "#A15D43" },
  section: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5DCD7",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#302A27",
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F7EAE4",
    fontSize: 12,
    fontWeight: "700",
    color: "#A15D43",
  },
  notes: { fontSize: 14, lineHeight: 21, color: "#746C68" },
  useButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: "#A15D43",
  },
  useButtonText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  deleteButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  deleteButtonText: { fontSize: 14, fontWeight: "800", color: "#B94747" },
});