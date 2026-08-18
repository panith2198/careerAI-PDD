import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme';

type MetricTileProps = {
  label: string;
  value: string;
};

export function MetricTile({ label, value }: MetricTileProps) {
  return (
    <View style={styles.tile}>
      <Text numberOfLines={1} style={styles.value}>
        {value}
      </Text>
      <Text numberOfLines={2} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 92,
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
