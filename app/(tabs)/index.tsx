import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import {
  Radius,
  Spacing,
} from "@/constants/spacing";

export default function HomeScreen() {
  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              FLIGHTFITS
            </Text>

            <Text style={styles.title}>
              Plan the trip.
              {"\n"}
              Pack the look.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              M
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>
            ✈️
          </Text>

          <Text style={styles.heroTitle}>
            Where are you going next?
          </Text>

          <Text style={styles.heroDescription}>
            Build your itinerary, discover local
            events, plan outfits, and generate a
            personalized packing list.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push("/create-trip")
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed &&
                styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Create a trip
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Quick actions
        </Text>

        <View style={styles.actionGrid}>
          <QuickAction
            emoji="✨"
            label="Discover outfits"
            onPress={() =>
              router.push("/(tabs)/discover")
            }
          />

          <QuickAction
            emoji="👗"
            label="Build an outfit"
            onPress={() =>
              router.push("/outfit-builder")
            }
          />

          <QuickAction
            emoji="🎟️"
            label="Nearby events"
            onPress={() =>
              router.push("/nearby-events")
            }
          />

          <QuickAction
            emoji="🧳"
            label="View trips"
            onPress={() =>
              router.push("/(tabs)/trips")
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface QuickActionProps {
  emoji: string;
  label: string;
  onPress: () => void;
}

function QuickAction({
  emoji,
  label,
  onPress,
}: QuickActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.cardPressed,
      ]}
    >
      <Text style={styles.actionEmoji}>
        {emoji}
      </Text>

      <Text style={styles.actionLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: Spacing.xs,
  },
  title: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 40,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  avatarText: {
    color: Colors.primaryDark,
    fontSize: 18,
    fontWeight: "800",
  },
  hero: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  heroEmoji: {
    marginBottom: Spacing.sm,
    fontSize: 36,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: Spacing.sm,
  },
  heroDescription: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
  },
  primaryButtonPressed: {
    backgroundColor: Colors.primaryPressed,
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actionCard: {
    width: "48%",
    minHeight: 120,
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardPressed: {
    opacity: 0.72,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
});