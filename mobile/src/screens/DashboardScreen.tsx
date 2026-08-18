import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { getDashboard } from '../api/endpoints';
import { MetricTile } from '../components/MetricTile';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { colors, radii, spacing } from '../theme';

export function DashboardScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mobile-dashboard'],
    queryFn: getDashboard,
  });

  const fulfilled = data?.filter((item) => item.status === 'fulfilled').length || 0;

  return (
    <Screen>
      <SectionHeader title="Dashboard" subtitle="A mobile overview of your CareerAI workspace." />

      <View style={styles.metricRow}>
        <MetricTile label="API modules online" value={isLoading ? '...' : `${fulfilled}/4`} />
        <MetricTile label="CareerAI mobile" value="Expo" />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Mobile roadmap</Text>
        <Text style={styles.panelText}>This React Native app is wired to the same FastAPI backend as the web portal.</Text>
        <Text style={styles.panelText}>Next production slices should port assessment flows, resume upload, and streaming RAG chat.</Text>
      </View>

      {error ? <Text style={styles.error}>Backend unreachable: {error.message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  panel: {
    gap: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  panelText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: colors.amber,
    fontSize: 13,
    lineHeight: 19,
  },
});
