import { router } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>✈️</Text>
        </View>

        <Text style={styles.brand}>FlightFits</Text>
        <Text style={styles.title}>Pack smarter. Travel in style.</Text>
        <Text style={styles.subtitle}>
          Create personalized packing lists based on your destination,
          activities, luggage, and travel style.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Create an account"
          onPress={() => router.push("/signup")}
        />
        <SecondaryButton
          label="I already have an account"
          onPress={() => router.push("/login")}
        />
        <Text
          style={styles.skip}
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
        >
          Continue as guest
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  logoEmoji: {
    fontSize: 48,
  },
  brand: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: Spacing.md,
    maxWidth: 340,
  },
  actions: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  skip: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.sm,
  },
});
