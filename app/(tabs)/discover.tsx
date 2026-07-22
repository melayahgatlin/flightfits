import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/constants/colors";
import {
  Radius,
  Spacing,
} from "@/constants/spacing";

const DISCOVERY_SECTIONS = [
  {
    id: "airport",
    title: "Airport fits",
    subtitle:
      "Comfortable looks that still feel put together.",
    emoji: "✈️",
  },
  {
    id: "fashion-week",
    title: "Fashion week",
    subtitle:
      "Editorial inspiration for major fashion cities.",
    emoji: "✨",
  },
  {
    id: "summer",
    title: "Summer destinations",
    subtitle:
      "Warm-weather looks for beaches and city days.",
    emoji: "☀️",
  },
  {
    id: "budget",
    title: "Budget-friendly looks",
    subtitle:
      "Recreate community outfits using what you own.",
    emoji: "💜",
  },
] as const;

export default function DiscoverScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>
        Find your next look
      </Text>

      <Text style={styles.subheading}>
        Browse community outfits, destination
        inspiration, and looks for events near your
        trip.
      </Text>

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push("/outfit-builder")
          }
          style={({ pressed }) => [
            styles.primaryAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryActionText}>
            Build outfit
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push("/create-board")
          }
          style={({ pressed }) => [
            styles.secondaryAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryActionText}>
            New board
          </Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {DISCOVERY_SECTIONS.map((section) => (
          <Pressable
            accessibilityRole="button"
            key={section.id}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.cardEmoji}>
              {section.emoji}
            </Text>

            <Text style={styles.cardTitle}>
              {section.title}
            </Text>

            <Text style={styles.cardSubtitle}>
              {section.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  heading: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subheading: {
    color: Colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  primaryAction: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryAction: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  secondaryActionText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  card: {
    width: "48%",
    minHeight: 190,
    padding: Spacing.md,
    justifyContent: "flex-end",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardEmoji: {
    fontSize: 35,
    marginBottom: "auto",
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.72,
  },
});