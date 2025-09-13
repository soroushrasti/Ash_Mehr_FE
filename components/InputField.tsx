import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Spacing, Layout, Typography } from '@/constants/Design';

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rtl?: boolean;
  required?: boolean;
}

export function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  disabled = false,
  rightIcon,
  leftIcon,
  rtl = true,
  required = false,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'textTertiary');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  const getBorderColor = () => {
    if (error) return errorColor;
    if (isFocused) return primaryColor;
    return borderColor;
  };

  return (
    <ThemedView style={styles.container}>
      {label && (
        <ThemedText type="caption" weight="medium" style={styles.label} rtl={rtl}>
          {label}
          {required && <ThemedText style={[styles.required, { color: errorColor }]}> *</ThemedText>}
        </ThemedText>
      )}

      <View style={[
        styles.inputContainer,
        { backgroundColor, borderColor: getBorderColor() },
        multiline && styles.multilineContainer,
        disabled && styles.disabled,
      ].filter(Boolean)}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: textColor },
            multiline && styles.multilineInput,
            rtl && styles.rtlInput,
          ].filter(Boolean)}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          textAlign={rtl ? 'right' : 'left'}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <ThemedText style={{ color: placeholderColor }}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </ThemedText>
          </TouchableOpacity>
        )}

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && (
        <ThemedText type="caption" style={[styles.error, { color: errorColor }]} rtl={rtl}>
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  required: {
    fontSize: Typography.sizes.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  multilineContainer: {
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  rtlInput: {
    // Removed invalid writingDirection property
    // RTL is handled by textAlign prop instead
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  eyeIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  error: {
    marginTop: Spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});
