import React from 'react';
import { TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius, Shadows } from '@/constants/Design';

interface SignOutButtonProps {
  variant?: 'icon' | 'button' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export function SignOutButton({
  variant = 'icon',
  size = 'medium',
  showText = false,
  style
}: SignOutButtonProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const emergencyColor = useThemeColor({}, 'emergency');
  const textColor = useThemeColor({}, 'text');

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm('آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟') : true;
      if (ok) {
        (async () => {
          try {
            await signOut();
            router.replace('/(auth)/sign-in');
          } catch {
            // no-op
          }
        })();
      }
      return;
    }

    // Native confirmation
    Alert.alert(
      'خروج از حساب کاربری',
      'آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch {
              // no-op
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 36, height: 36, iconSize: 16 };
      case 'large':
        return { width: 64, height: 64, iconSize: 24 };
      default:
        return { width: 48, height: 48, iconSize: 20 };
    }
  };

  const sizeStyles = getSizeStyles();

  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[styles.minimalButton, { marginLeft: Spacing.md }, style]}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.minimalIcon, { fontSize: sizeStyles.iconSize }]}>
          🚪
        </ThemedText>
        {showText && (
          <ThemedText style={[styles.minimalText, { color: textColor }]}>
            خروج
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'button') {
    return (
      <TouchableOpacity
        style={[styles.buttonContainer, { marginLeft: Spacing.md }, style]}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[emergencyColor, '#f87171']}
          style={[
            styles.gradientButton,
            {
              width: showText ? 'auto' : sizeStyles.width + 8,
              height: sizeStyles.height + 8,
              paddingHorizontal: showText ? Spacing.lg : 0,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={[styles.buttonIcon, { fontSize: sizeStyles.iconSize }]}>
            🚪
          </ThemedText>
          {showText && <ThemedText style={styles.buttonText}>خروج</ThemedText>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Default icon variant with glass morphism
  return (
    <TouchableOpacity
      style={[
        styles.iconContainer,
        {
          width: sizeStyles.width + 8,
          height: sizeStyles.height + 8,
          marginLeft: Spacing.md,
        },
        style,
      ]}
      onPress={handleSignOut}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {/* Glow effect contained within wrapper */}
      <ThemedView
        style={[
          styles.iconGlow,
          { backgroundColor: emergencyColor + '20', borderRadius: BorderRadius.full },
        ]}
        pointerEvents="none"
      />

      <BlurView intensity={20} style={styles.iconBlur}>
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.9)', 'rgba(248, 113, 113, 0.7)']}
          style={[styles.iconGradient, { width: sizeStyles.width, height: sizeStyles.height, borderRadius: BorderRadius.full }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={[styles.icon, { fontSize: sizeStyles.iconSize }]}>
            🚪
          </ThemedText>
        </LinearGradient>
      </BlurView>

      {showText && (
        <ThemedText style={[styles.iconText, { color: textColor }]}>
          خروج
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Icon variant styles
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBlur: {
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadows.md,
    zIndex: 2,
  },
  iconGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontWeight: 'bold',
  },
  iconGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  iconText: {
    marginTop: Spacing.xs,
    fontSize: 12,
    fontWeight: '600',
  },

  // Button variant styles
  buttonContainer: {
    ...Shadows.md,
  },
  gradientButton: {
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  buttonIcon: {
    color: 'white',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },

  // Minimal variant styles
  minimalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  minimalIcon: {
    opacity: 0.7,
  },
  minimalText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
});
