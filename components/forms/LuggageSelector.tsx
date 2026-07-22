import { Pressable, StyleSheet, Text, View } from "react-native";
import { LUGGAGE_OPTIONS } from "@/constants/luggage";
import { Colors } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/spacing";
import type { LuggageType } from "@/types/trip";

interface LuggageSelectorProps {
  value: LuggageType;
  onChange: (value: LuggageType) => void;
}

export function LuggageSelector({
  value,
  onChange,
}: LuggageSelectorProps) {
  return (
    <View style={styles.container}>
      {LUGGAGE_OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  option: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  labelSelected: {
    color: Colors.primaryDark,
  },
});
