import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing } from '../theme';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <Screen>
      <SectionHeader title="Profile" subtitle="Session and mobile account controls." />
      <View style={styles.panel}>
        <Text style={styles.label}>Signed in</Text>
        <Text style={styles.value}>{user ? JSON.stringify(user, null, 2) : 'Authenticated session'}</Text>
      </View>
      <AppButton onPress={clearAuth} variant="secondary">
        Sign out
      </AppButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  label: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
