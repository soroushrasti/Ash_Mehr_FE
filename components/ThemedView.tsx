import React from 'react';
import { View, type ViewProps, StyleSheet, Platform } from 'react-native';

import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius, Shadows } from '@/constants/Design';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'surface' | 'card' | 'container' | 'section';
  padding?: keyof typeof Spacing;
  margin?: keyof typeof Spacing;
  rounded?: keyof typeof BorderRadius;
  shadow?: keyof typeof Shadows;
  center?: boolean;
  rtl?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = 'default',
  padding,
  margin,
  rounded,
  shadow,
  center = false,
  rtl = true, // Default to RTL for Farsi support
  children,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    type === 'surface' ? 'surface' :
    type === 'card' ? 'surface' : 'background'
  );

  const shadowStyle = shadow
    ? Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
      : { ...Shadows[shadow], shadowColor: '#000' }
    : undefined;

  const content = Platform.OS === 'web'
    ? React.Children.map(children, (child) =>
        typeof child === 'string' || typeof child === 'number'
          ? <ThemedText>{String(child)}</ThemedText>
          : child
      )
    : children;

  return (
    <View
      style={[
        { backgroundColor },
        type === 'card' && styles.card,
        type === 'container' && styles.container,
        type === 'section' && styles.section,
        rtl && styles.rtlContainer,
        padding && { padding: Spacing[padding] },
        margin && { margin: Spacing[margin] },
        rounded && { borderRadius: BorderRadius[rounded] },
        center && styles.center,
        shadowStyle,
        style,
      ]}
      {...otherProps}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  container: {
    padding: Spacing.lg,
  },
  section: {
    marginVertical: Spacing.md,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rtlContainer: {
    direction: 'rtl' as any,
  },
});
