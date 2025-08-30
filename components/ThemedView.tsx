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
        type === 'container' ? styles.container : undefined,
        type === 'card' ? styles.card : undefined,
        type === 'section' ? styles.section : undefined,
        padding ? { padding: Spacing[padding] } : undefined,
        margin ? { margin: Spacing[margin] } : undefined,
        rounded ? { borderRadius: BorderRadius[rounded] } : undefined,
        shadowStyle,
        center ? styles.center : undefined,
        style
      ].filter(Boolean)}
      {...otherProps}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    ...Shadows.md,
    shadowColor: '#000',
  },
  section: {
    marginVertical: Spacing.md,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
