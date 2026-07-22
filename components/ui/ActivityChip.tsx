import { Pressable, StyleSheet, Text } from 'react-native';

type ActivityChipProps = {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
};

export default function ActivityChip({
  label,
  emoji,
  selected,
  onPress,
}: ActivityChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selectedChip,
        pressed && styles.pressedChip,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {emoji ? `${emoji} ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8D2CF',
    backgroundColor: '#FFFFFF',
  },

  selectedChip: {
    backgroundColor: '#1F1F1F',
    borderColor: '#1F1F1F',
  },

  pressedChip: {
    opacity: 0.75,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26211F',
  },

  selectedLabel: {
    color: '#FFFFFF',
  },
});