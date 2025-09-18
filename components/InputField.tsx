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
  rtl = true, // Default to RTL for Farsi
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
    <ThemedView style={styles.container} rtl={rtl}>
      {label && (
        <ThemedText type="caption" weight="medium" style={styles.label} rtl={rtl}>
          {label}
          {required && <ThemedText style={[styles.required, { color: errorColor }]} rtl={rtl}> *</ThemedText>}
        </ThemedText>
      )}

      <View style={[
        styles.inputContainer,
        { backgroundColor, borderColor: getBorderColor() },
        multiline && styles.multilineContainer,
        disabled && styles.disabled,
        rtl && styles.rtlInputContainer,
      ]}>
        {rtl && rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        {!rtl && leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: textColor },
            multiline && styles.multilineInput,
            rtl && styles.rtlInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlign={rtl ? 'right' : 'left'}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={rtl ? styles.leftIcon : styles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <ThemedText style={styles.eyeIcon}>
              {showPassword ? '🙈' : '👁️'}
            </ThemedText>
          </TouchableOpacity>
        )}

        {rtl && leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        {!rtl && rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && (
        <ThemedText type="caption" style={[styles.errorText, { color: errorColor }]} rtl={rtl}>
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
    marginBottom: Spacing.xs,
  },
  required: {
    fontSize: Typography.sizes.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: Layout.inputHeight,
  },
  rtlInputContainer: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.md,
    paddingVertical: Spacing.sm,
  },
  rtlInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  multilineContainer: {
    minHeight: Layout.inputHeight * 2,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: Layout.inputHeight,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
});
