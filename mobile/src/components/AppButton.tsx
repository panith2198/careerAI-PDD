import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radii, spacing } from '../theme';

type AppButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}>;

export function AppButton({ children, onPress, disabled, variant = 'primary', style }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: colors.primarySoft,
  },
});
