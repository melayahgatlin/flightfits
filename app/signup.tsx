import { useState } from "react";
import { router } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppTextInput } from "@/components/inputs/AppTextInput";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { isValidEmail } from "@/utils/validation";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSignup() {
    if (!name.trim()) {
      Alert.alert("Add your name", "Enter your name to continue.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Check your email", "Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Check your password", "Password must be at least 6 characters.");
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Start building personalized packing lists for every trip.
        </Text>

        <View style={styles.form}>
          <AppTextInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
          />
          <PrimaryButton label="Create account" onPress={handleSignup} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    justifyContent: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
  },
});
