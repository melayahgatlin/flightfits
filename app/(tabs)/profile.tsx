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

const PROFILE_ACTIONS = [
  "Edit profile",
  "My outfit boards",
  "Saved inspiration",
  "Travel preferences",
  "Privacy and safety",
  "Settings",
] as const;

export default function ProfileScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            M
          </Text>
        </View>

        <View style={styles.profileText}>
          <Text style={styles.name}>
            Your profile
          </Text>

          <Text style={styles.username}>
            @flightfits-traveler
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <ProfileStat
          value="0"
          label="Outfits"
        />
        <ProfileStat
          value="0"
          label="Boards"
        />
        <ProfileStat
          value="0"
          label="Trips"
        />
      </View>

      <View style={styles.actions}>
        {PROFILE_ACTIONS.map((action) => (
          <Pressable
            accessibilityRole="button"
            key={action}
            style={({ pressed }) => [
              styles.action,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionText}>
              {action}
            </Text>

            <Text style={styles.chevron}>
              ›
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

interface ProfileStatProps {
  value: string;
  label: string;
}

function ProfileStat({
  value,
  label,
}: ProfileStatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  avatarText: {
    color: Colors.primaryDark,
    fontSize: 29,
    fontWeight: "800",
  },
  profileText: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: "800",
  },
  username: {
    color: Colors.textMuted,
    fontSize: 15,
    marginTop: Spacing.xxs,
  },
  stats: {
    flexDirection: "row",
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.xxs,
  },
  actions: {
    overflow: "hidden",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  action: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  actionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  chevron: {
    color: Colors.textMuted,
    fontSize: 26,
  },
  pressed: {
    opacity: 0.65,
  },
});