import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { login } from '../api/endpoints';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing } from '../theme';

export function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: (payload) => {
      const token = payload.access_token || payload.token;
      if (!token) {
        Alert.alert('Login failed', 'The API did not return an access token.');
        return;
      }
      setSession(payload.user || null, token, payload.refresh_token);
    },
    onError: (error) => {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Check your credentials and try again.');
    },
  });

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.brandBlock}>
          <Text style={styles.logo}>CareerAI</Text>
          <Text style={styles.headline}>Career guidance, assessments, jobs, and AI chat in one mobile app.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.dim}
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.dim}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <AppButton
            disabled={!email || !password || loginMutation.isPending}
            onPress={() => loginMutation.mutate()}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </AppButton>
        </View>

        <Text style={styles.note}>Set `EXPO_PUBLIC_API_BASE_URL` if your backend is not on the default local URL.</Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  brandBlock: {
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  logo: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
  },
  headline: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    minHeight: 52,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
  },
  note: {
    color: colors.dim,
    fontSize: 12,
    lineHeight: 18,
  },
});
