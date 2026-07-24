import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getClosetItems } from "../../services/closetService";
import {
  deletePlannedOutfit,
  getPlannedOutfits,
  toggleOutfitFavorite,
} from "../../services/outfitPlannerService";
import type { ClosetItem } from "../../types/closet";
import type { PlannedOutfit } from "../../types/outfitPlanner";

export default function OutfitPlannerScreen() {
  const [outfits, setOutfits] = useState<PlannedOutfit[]>([]);
  const [closet, setCloset] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [savedOutfits, closetItems] = await Promise.all([
      getPlannedOutfits(),
      getClosetItems(),
    ]);
    setOutfits(savedOutfits);
    setCloset(closetItems);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const getItems = (outfit: PlannedOutfit) =>
    outfit.closetItemIds
      .map((id) => closet.find((item) => item.id === id))
      .filter((item): item is ClosetItem => Boolean(item));

  const confirmDelete = (outfit: PlannedOutfit) => {
    Alert.alert("Delete outfit?", `Remove "${outfit.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deletePlannedOutfit(outfit.id);
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
          <Text style={styles.eyebrow}>STYLE YOUR TRIP</Text>
          <Text style={styles.title}>Outfit Planner</Text>
          <Text style={styles.subtitle}>{outfits.length} planned looks</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/outfit/create" as never)}
        >
          <Text style={styles.addButtonText}>＋ Create</Text>
        </Pressable>
      </View>

      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>Plan your first look</Text>
            <Text style={styles.emptyText}>
              Combine pieces from your closet and save outfits for dinners,
              activities, flights, and special events.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push("/outfit/create" as never)}
            >
              <Text style={styles.emptyButtonText}>Create an outfit</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const pieces = getItems(item);

          return (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/outfit/[outfitId]" as never,
                  params: { outfitId: item.id },
                })
              }
              onLongPress={() => confirmDelete(item)}
            >
              <View style={styles.collage}>
                {pieces.slice(0, 4).map((piece, index) =>
                  piece.imageUri ? (
                    <Image
                      key={piece.id}
                      source={{ uri: piece.imageUri }}
                      style={styles.collageImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View key={piece.id} style={styles.collagePlaceholder}>
                      <Text>👕</Text>
                    </View>
                  )
                )}

                {!pieces.length ? (
                  <View style={styles.collageEmpty}>
                    <Text style={styles.collageEmptyEmoji}>👗</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cardBody}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.occasion}>
                    {item.occasion.toUpperCase()}
                  </Text>
                  <Text style={styles.outfitName}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.date ?? "No date"} • {pieces.length} pieces
                  </Text>
                </View>

                <Pressable
                  onPress={async () => {
                    await toggleOutfitFavorite(item.id);
                    await load();
                  }}
                >
                  <Text style={styles.heart}>
                    {item.favorite ? "♥" : "♡"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
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
    padding: 20,
  },
  eyebrow: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#A15D43",
  },
  title: { fontSize: 28, fontWeight: "800", color: "#302A27" },
  subtitle: { marginTop: 4, fontSize: 13, color: "#817772" },
  addButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: "#A15D43",
  },
  addButtonText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5DCD7",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  collage: {
    height: 225,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F0E8E3",
  },
  collageImage: { width: "50%", height: "50%" },
  collagePlaceholder: {
    width: "50%",
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7EAE4",
  },
  collageEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  collageEmptyEmoji: { fontSize: 60 },
  cardBody: { flexDirection: "row", alignItems: "center", padding: 16 },
  occasion: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#A15D43",
  },
  outfitName: { fontSize: 18, fontWeight: "800", color: "#302A27" },
  meta: { marginTop: 5, fontSize: 12, color: "#817772" },
  heart: { paddingLeft: 12, fontSize: 27, color: "#A15D43" },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyEmoji: { marginBottom: 12, fontSize: 50 },
  emptyTitle: {
    marginBottom: 7,
    fontSize: 21,
    fontWeight: "800",
    color: "#302A27",
  },
  emptyText: {
    maxWidth: 320,
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
});
