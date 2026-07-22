import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
}

export function EmptyState({ emoji, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: Spacing.md,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing.sm,
    maxWidth: 320,
  },
});
