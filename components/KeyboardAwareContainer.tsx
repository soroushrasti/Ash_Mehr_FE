import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewStyle
} from 'react-native';

interface KeyboardAwareContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
}

export function KeyboardAwareContainer({
  children,
  style,
  scrollEnabled = true
}: KeyboardAwareContainerProps) {
  const behavior = Platform.OS === 'ios' ? 'padding' : 'height';

  if (!scrollEnabled) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, style]}
        behavior={behavior}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={behavior}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Add default export to support both import styles
export default KeyboardAwareContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 48,
  },
});
