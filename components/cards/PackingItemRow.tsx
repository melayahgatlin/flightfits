import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/spacing";
import type { PackingItem } from "@/types/packing";

interface PackingItemRowProps {
  item: PackingItem;
  onToggle: () => void;
  onDelete: () => void;
}

export function PackingItemRow({
  item,
  onToggle,
  onDelete,
}: PackingItemRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.packed }}
        onPress={onToggle}
        style={[styles.checkbox, item.packed && styles.checkboxChecked]}
      >
        <Text style={styles.check}>{item.packed ? "✓" : ""}</Text>
      </Pressable>

      <Pressable style={styles.content} onPress={onToggle}>
        <Text style={[styles.name, item.packed && styles.namePacked]}>
          {item.name}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
      </Pressable>

      <Pressable
        accessibilityLabel={`Delete ${item.name}`}
        onPress={onDelete}
        hitSlop={12}
      >
        <Text style={styles.delete}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  check: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  content: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  namePacked: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  category: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 3,
    textTransform: "capitalize",
  },
  delete: {
    color: Colors.danger,
    fontSize: 26,
    lineHeight: 26,
  },
});
