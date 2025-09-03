import React, { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, ViewStyle, Keyboard } from 'react-native';

export type KeyboardAwareContainerProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraKeyboardOffset?: number;
  testID?: string;
}>;

export default function KeyboardAwareContainer({ children, contentContainerStyle, extraKeyboardOffset = 0, testID }: KeyboardAwareContainerProps) {
  const behavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 + extraKeyboardOffset : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={behavior} keyboardVerticalOffset={keyboardVerticalOffset} testID={testID}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        contentInsetAdjustmentBehavior="always"
        nestedScrollEnabled
        overScrollMode={Platform.OS === 'android' ? 'always' : undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: 48 }, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
