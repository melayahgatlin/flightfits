import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/constants/colors";
import {
  Radius,
  Spacing,
} from "@/constants/spacing";

export default function ClosetScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>👗</Text>
      </View>

      <Text style={styles.title}>
        Build your digital closet
      </Text>

      <Text style={styles.description}>
        Add the clothing you already own so
        FlightFits can recommend outfits before
        suggesting anything new to buy.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push("/add-outfit")
        }
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          Add your first item
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.lg,
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    color: Colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  button: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  buttonPressed: {
    backgroundColor: Colors.primaryPressed,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "700",
  },
});