import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius, Typography } from '@/constants/Design';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  const getBackgroundColor = () => {
    if (disabled) return '#cccccc';

    switch (variant) {
      case 'primary':
        return primaryColor;
      case 'secondary':
        return surfaceColor;
      case 'outline':
        return 'transparent';
      case 'success':
        return successColor || '#4CAF50';
      case 'danger':
        return errorColor || '#f44336';
      default:
        return primaryColor;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#999999';

    switch (variant) {
      case 'primary':
      case 'success':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return textColor;
      case 'outline':
        return primaryColor;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? '#cccccc' : primaryColor;
    }
    return 'transparent';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          fontSize: Typography.sizes.sm,
        };
      case 'large':
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.sizes.lg,
        };
      default: // medium
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          fontSize: Typography.sizes.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loader}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outline: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: Typography.weights.semibold as any,
    textAlign: 'center',
  },
  loader: {
    marginRight: Spacing.xs,
  },
});
