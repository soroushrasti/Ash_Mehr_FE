import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { ThemedText } from './ThemedText';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export default function AppHeader({ title, subtitle, rightAction, style }: AppHeaderProps) {
  const primary = useThemeColor({}, 'primary');
  const gradientStart = useThemeColor({}, 'gradientStart');
  const gradientEnd = useThemeColor({}, 'gradientEnd');

  return (
    <View style={[styles.headerContainer, style]}>
      <LinearGradient
        colors={[primary, gradientStart, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative subtle circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <View style={styles.contentRow}>
          <View style={styles.texts}>
            <ThemedText type="heading2" weight="bold" style={styles.title}>
              {title}
            </ThemedText>
            {!!subtitle && (
              <ThemedText type="body" style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            )}
          </View>
          {rightAction}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  header: {
    paddingTop: 56,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  texts: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.9,
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.full,
  },
  circle1: { width: 120, height: 120, top: -40, right: -40 },
  circle2: { width: 80, height: 80, top: 10, left: -20 },
  circle3: { width: 60, height: 60, bottom: -10, right: 40 },
});

