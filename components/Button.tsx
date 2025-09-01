import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Spacing, Layout } from '@/constants/Design';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'textPrimary');
  const borderColor = useThemeColor({}, 'border');

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];

    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled) baseStyle.push(styles.disabled);

    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: primaryColor }];
      case 'secondary':
        return [...baseStyle, { backgroundColor: secondaryColor }];
      case 'outline':
        return [...baseStyle, styles.outline, { borderColor: primaryColor, backgroundColor: 'transparent' }];
      case 'ghost':
        return [...baseStyle, { backgroundColor: 'transparent' }];
      case 'success':
        return [...baseStyle, { backgroundColor: useThemeColor({}, 'success') }];
      case 'warning':
        return [...baseStyle, { backgroundColor: useThemeColor({}, 'warning') }];
      case 'error':
        return [...baseStyle, { backgroundColor: useThemeColor({}, 'error') }];
      default:
        return [...baseStyle, { backgroundColor: primaryColor }];
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return primaryColor;
    }
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle().filter(Boolean), style].filter(Boolean)}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && icon}
          <ThemedText
            type="button"
            style={[{ color: getTextColor() }, icon && styles.textWithIcon].filter(Boolean)}
            center
          >
            {title}
          </ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  small: {
    height: 36,
    paddingHorizontal: Spacing.md,
  },
  medium: {
    height: Layout.buttonHeight,
  },
  large: {
    height: 56,
    paddingHorizontal: Spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  outline: {
    borderWidth: 1,
  },
  textWithIcon: {
    marginLeft: Spacing.sm,
  },
});
