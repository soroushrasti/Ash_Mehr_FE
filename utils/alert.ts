import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'destructive' | 'default';
}

/**
 * Cross-platform alert:
 * - On native: delegates to Alert.alert
 * - On web: uses window.alert / window.confirm to emulate basic behavior
 */
export function showAlert(
  title: string,
  message: string,
  buttons?: AlertButton[]
) {
  if (Platform.OS !== 'web') {
    if (buttons && buttons.length) {
      Alert.alert(title, message, buttons.map(b => ({ text: b.text, onPress: b.onPress, style: b.style })));
    } else {
      Alert.alert(title, message);
    }
    return;
  }

  // Web implementation
  if (!buttons || buttons.length === 0) {
    window.alert(`${title}\n${message}`);
    return;
  }

  if (buttons.length === 1) {
    window.alert(`${title}\n${message}`);
    buttons[0].onPress?.();
    return;
  }

  if (buttons.length === 2) {
    const primary = buttons[1];
    const cancel = buttons[0];
    const confirmed = window.confirm(`${title}\n${message}`);
    if (confirmed) {
      primary.onPress?.();
    } else {
      cancel.onPress?.();
    }
    return;
  }

  // Fallback for >2 buttons: list them and just alert
  window.alert(`${title}\n${message}`);
  // Could be extended to render a custom modal in the future
}

