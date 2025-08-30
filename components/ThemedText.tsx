import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography, Spacing } from '@/constants/Design';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'body' | 'caption' | 'button' | 'heading1' | 'heading2' | 'heading3';
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  center?: boolean;
  rtl?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  weight = 'regular',
  center = false,
  rtl = true, // Default to RTL for Farsi
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'textPrimary');

  return (
    <Text
      style={[
        { color },
        styles.base,
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'button' ? styles.button : undefined,
        type === 'heading1' ? styles.heading1 : undefined,
        type === 'heading2' ? styles.heading2 : undefined,
        type === 'heading3' ? styles.heading3 : undefined,
        weight === 'light' ? styles.light : undefined,
        weight === 'medium' ? styles.medium : undefined,
        weight === 'bold' ? styles.bold : undefined,
        center ? styles.center : undefined,
        rtl ? styles.rtl : styles.ltr,
        style,
      ].filter(Boolean)} // <-- Filter out undefined, false, null
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontFamily.regular,
  },
  default: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    lineHeight: Typography.fontSize['4xl'] * Typography.lineHeight.tight,
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.xl,
    lineHeight: Typography.fontSize.xl * Typography.lineHeight.snug,
    fontFamily: Typography.fontFamily.medium,
  },
  body: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  button: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.tight,
    fontFamily: Typography.fontFamily.medium,
  },
  heading1: {
    fontSize: Typography.fontSize['5xl'],
    lineHeight: Typography.fontSize['5xl'] * Typography.lineHeight.tight,
    fontFamily: Typography.fontFamily.bold,
  },
  heading2: {
    fontSize: Typography.fontSize['3xl'],
    lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
    fontFamily: Typography.fontFamily.bold,
  },
  heading3: {
    fontSize: Typography.fontSize['2xl'],
    lineHeight: Typography.fontSize['2xl'] * Typography.lineHeight.snug,
    fontFamily: Typography.fontFamily.medium,
  },
  light: {
    fontFamily: Typography.fontFamily.light,
  },
  medium: {
    fontFamily: Typography.fontFamily.medium,
  },
  bold: {
    fontFamily: Typography.fontFamily.bold,
  },
  center: {
    textAlign: 'center',
  },
  rtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  ltr: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
});
