import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
};

export function ListRow({ title, subtitle, meta }: ListRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '800',
  },
});
