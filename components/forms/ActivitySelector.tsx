import { StyleSheet, View } from 'react-native';

import ActivityChip from '@/components/ui/ActivityChip';

export type ActivityOption = {
  id: string;
  label: string;
  emoji: string;
};

type ActivitySelectorProps = {
  activities: ActivityOption[];
  selected: string[];
  onToggle: (activityId: string) => void;
};

export default function ActivitySelector({
  activities,
  selected,
  onToggle,
}: ActivitySelectorProps) {
  return (
    <View style={styles.container}>
      {activities.map((activity) => (
        <ActivityChip
          key={activity.id}
          label={activity.label}
          emoji={activity.emoji}
          selected={selected.includes(activity.id)}
          onPress={() => onToggle(activity.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});