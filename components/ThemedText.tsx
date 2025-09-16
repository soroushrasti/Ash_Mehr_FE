import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography, RTL } from '@/constants/Design';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'heading1' | 'heading2' | 'body' | 'caption';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  rtl?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  weight,
  rtl = true, // Default to RTL for Farsi
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        styles.base,
        rtl && styles.rtlText,
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'heading1' ? styles.heading1 : undefined,
        type === 'heading2' ? styles.heading2 : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'caption' ? styles.caption : undefined,
        weight ? { fontWeight: Typography.weights[weight] as any } : undefined,
        { color },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontFamily.regular,
  },
  rtlText: {
    textAlign: RTL.textAlign,
    writingDirection: RTL.writingDirection,
  },
  default: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    lineHeight: Typography.fontSize['4xl'] * Typography.lineHeight.tight,
    fontWeight: Typography.weights.bold as any,
  },
  defaultSemiBold: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    fontWeight: Typography.weights.semibold as any,
  },
  subtitle: {
    fontSize: Typography.fontSize.xl,
    lineHeight: Typography.fontSize.xl * Typography.lineHeight.normal,
    fontWeight: Typography.weights.medium as any,
  },
  link: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    color: '#0a7ea4',
  },
  heading1: {
    fontSize: Typography.fontSize['5xl'],
    lineHeight: Typography.fontSize['5xl'] * Typography.lineHeight.tight,
    fontWeight: Typography.weights.bold as any,
  },
  heading2: {
    fontSize: Typography.fontSize['3xl'],
    lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
    fontWeight: Typography.weights.semibold as any,
  },
  body: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    fontWeight: Typography.weights.light as any,
  },
});
