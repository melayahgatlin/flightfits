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

import { getClosetItems } from "../../services/closetService";
import {
  deletePlannedOutfit,
  getPlannedOutfit,
  toggleOutfitFavorite,
} from "../../services/outfitPlannerService";
import type { ClosetItem } from "../../types/closet";
import type { PlannedOutfit } from "../../types/outfitPlanner";

export default function OutfitDetailsScreen() {
  const params = useLocalSearchParams<{ outfitId?: string | string[] }>();
  const outfitId = Array.isArray(params.outfitId)
    ? params.outfitId[0]
    : params.outfitId;

  const [outfit, setOutfit] = useState<PlannedOutfit | null>(null);
  const [pieces, setPieces] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!outfitId) return;

    const [savedOutfit, closet] = await Promise.all([
      getPlannedOutfit(outfitId),
      getClosetItems(),
    ]);

    setOutfit(savedOutfit);
    setPieces(
      savedOutfit
        ? savedOutfit.closetItemIds
            .map((id) => closet.find((item) => item.id === id))
            .filter((item): item is ClosetItem => Boolean(item))
        : []
    );
    setLoading(false);
  }, [outfitId]);

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

  if (!outfit) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Outfit not found</Text>
      </SafeAreaView>
    );
  }

  const remove = () => {
    Alert.alert("Delete outfit?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deletePlannedOutfit(outfit.id);
          router.replace("/outfit" as never);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.collage}>
          {pieces.slice(0, 4).map((piece) =>
            piece.imageUri ? (
              <Image
                key={piece.id}
                source={{ uri: piece.imageUri }}
                style={styles.image}
                contentFit="cover"
              />
            ) : (
              <View key={piece.id} style={styles.placeholder}>
                <Text style={{ fontSize: 30 }}>👕</Text>
              </View>
            )
          )}
        </View>

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              {outfit.occasion.toUpperCase()}
            </Text>
            <Text style={styles.title}>{outfit.name}</Text>
            <Text style={styles.meta}>
              {outfit.date ?? "No date selected"} • {pieces.length} pieces
            </Text>
          </View>

          <Pressable
            style={styles.favorite}
            onPress={async () => {
              await toggleOutfitFavorite(outfit.id);
              await load();
            }}
          >
            <Text style={styles.favoriteText}>
              {outfit.favorite ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Pieces</Text>
        {pieces.map((piece) => (
          <Pressable
            key={piece.id}
            style={styles.pieceRow}
            onPress={() =>
              router.push({
                pathname: "/closet/[itemId]" as never,
                params: { itemId: piece.id },
              })
            }
          >
            {piece.imageUri ? (
              <Image
                source={{ uri: piece.imageUri }}
                style={styles.pieceImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.pieceImage, styles.placeholder]}>
                <Text>👕</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.pieceName}>{piece.name}</Text>
              <Text style={styles.pieceMeta}>
                {piece.color} • {piece.category}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}

        {outfit.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{outfit.notes}</Text>
          </View>
        ) : null}

        <Pressable style={styles.deleteButton} onPress={remove}>
          <Text style={styles.deleteButtonText}>Delete outfit</Text>
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
  collage: {
    overflow: "hidden",
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 24,
    backgroundColor: "#EFE7E2",
  },
  image: { width: "50%", height: "50%" },
  placeholder: {
    width: "50%",
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7EAE4",
  },
  titleRow: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  eyebrow: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#A15D43",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#302A27" },
  meta: { marginTop: 5, fontSize: 13, color: "#817772" },
  favorite: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F7EAE4",
  },
  favoriteText: { fontSize: 28, color: "#A15D43" },
  sectionTitle: {
    marginTop: 21,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#302A27",
  },
  pieceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5DCD7",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  pieceImage: {
    width: 65,
    height: 75,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#EFE7E2",
  },
  pieceName: { fontSize: 14, fontWeight: "800", color: "#302A27" },
  pieceMeta: { marginTop: 4, fontSize: 11, color: "#817772" },
  arrow: { fontSize: 25, color: "#A49A95" },
  notesCard: {
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5DCD7",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  notes: { fontSize: 14, lineHeight: 21, color: "#746C68" },
  deleteButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  deleteButtonText: { fontSize: 14, fontWeight: "800", color: "#B94747" },
});