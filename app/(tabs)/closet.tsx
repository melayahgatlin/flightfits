import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteClosetItem,
  getClosetItems,
  toggleClosetFavorite,
} from "../../services/closetService";
import type {
  ClosetCategory,
  ClosetItem,
} from "../../types/closet";

const FILTERS: Array<{ label: string; value: "all" | ClosetCategory }> = [
  { label: "All", value: "all" },
  { label: "Tops", value: "tops" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Dresses", value: "dresses" },
  { label: "Shoes", value: "shoes" },
  { label: "Bags", value: "bags" },
  { label: "Accessories", value: "accessories" },
];

export default function ClosetScreen() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ClosetCategory>("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setItems(await getClosetItems());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter = filter === "all" || item.category === filter;
      const matchesQuery =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.color.toLowerCase().includes(normalized) ||
        item.brand?.toLowerCase().includes(normalized) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalized));

      return matchesFilter && matchesQuery;
    });
  }, [filter, items, query]);

  const confirmDelete = (item: ClosetItem) => {
    Alert.alert("Delete item?", `Remove "${item.name}" from your closet?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteClosetItem(item.id);
          await load();
        },
      },
    ]);
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
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>MY WARDROBE</Text>
          <Text style={styles.title}>Closet</Text>
          <Text style={styles.subtitle}>{items.length} saved pieces</Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/closet/add-item" as never)}
        >
          <Text style={styles.addButtonText}>＋ Add</Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search clothes, colors, brands..."
        placeholderTextColor="#A49A95"
        style={styles.search}
      />

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = filter === item.value;

          return (
            <Pressable
              onPress={() => setFilter(item.value)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👗</Text>
            <Text style={styles.emptyTitle}>
              {items.length ? "No matching pieces" : "Your closet is empty"}
            </Text>
            <Text style={styles.emptyText}>
              Add clothes, shoes, bags, and accessories to start planning outfits.
            </Text>
            {!items.length ? (
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push("/closet/add-item" as never)}
              >
                <Text style={styles.emptyButtonText}>Add your first item</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/closet/[itemId]" as never,
                params: { itemId: item.id },
              })
            }
            onLongPress={() => confirmDelete(item)}
            style={styles.card}
          >
            <View style={styles.imageWrap}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.image}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderEmoji}>👕</Text>
                </View>
              )}

              <Pressable
                style={styles.favoriteButton}
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

            <Text numberOfLines={1} style={styles.itemName}>
              {item.name}
            </Text>
            <Text numberOfLines={1} style={styles.itemMeta}>
              {item.color} • {item.category}
            </Text>
          </Pressable>
        )}
      />

      <Pressable
        style={styles.plannerButton}
        onPress={() => router.push("/outfit" as never)}
      >
        <Text style={styles.plannerButtonText}>✨ Open Outfit Planner</Text>
      </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  eyebrow: {
    marginBottom: 3,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#A15D43",
  },
  title: { fontSize: 30, fontWeight: "800", color: "#2F2926" },
  subtitle: { marginTop: 3, fontSize: 13, color: "#7C726D" },
  addButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: "#A15D43",
  },
  addButtonText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  search: {
    marginHorizontal: 20,
    minHeight: 48,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E3DAD5",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#2F2926",
  },
  filterRow: { paddingHorizontal: 20, paddingVertical: 13, gap: 8 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E1D8D3",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  filterChipActive: { borderColor: "#A15D43", backgroundColor: "#F7EAE4" },
  filterChipText: { fontSize: 12, fontWeight: "700", color: "#746C68" },
  filterChipTextActive: { color: "#A15D43" },
  grid: { paddingHorizontal: 20, paddingBottom: 110 },
  row: { gap: 12 },
  card: { flex: 1, maxWidth: "48.5%", marginBottom: 18 },
  imageWrap: {
    overflow: "hidden",
    aspectRatio: 0.82,
    borderRadius: 18,
    backgroundColor: "#EFE7E2",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderEmoji: { fontSize: 46 },
  favoriteButton: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  favoriteText: { fontSize: 21, color: "#A15D43" },
  itemName: {
    marginTop: 9,
    fontSize: 14,
    fontWeight: "800",
    color: "#302A27",
  },
  itemMeta: { marginTop: 3, fontSize: 11, color: "#817772" },
  empty: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 30,
  },
  emptyEmoji: { marginBottom: 12, fontSize: 50 },
  emptyTitle: {
    marginBottom: 7,
    fontSize: 20,
    fontWeight: "800",
    color: "#302A27",
  },
  emptyText: {
    maxWidth: 300,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#817772",
  },
  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 15,
    backgroundColor: "#A15D43",
  },
  emptyButtonText: { fontWeight: "800", color: "#FFFFFF" },
  plannerButton: {
    position: "absolute",
    right: 20,
    bottom: 18,
    left: 20,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#2F2926",
  },
  plannerButtonText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
});
