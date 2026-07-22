import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/spacing";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
}

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
});
