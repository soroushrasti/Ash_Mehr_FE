import { useAuth } from '@/components/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Index() {
  const { userType, isLoading } = useAuth();
  const primary = useThemeColor({}, 'primary');

  // Show loading screen while checking authentication state
  if (isLoading) {
    return (
      <ThemedView type="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primary} />
        <ThemedText style={{ marginTop: 16, fontSize: 16 }}>در حال بررسی وضعیت ورود...</ThemedText>
      </ThemedView>
    );
  }

  // Redirect based on authentication state
  if (!userType) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (userType === 'Admin') {
    return <Redirect href="/admin" />;
  }

  if (userType === 'GroupAdmin') {
    return <Redirect href="/group-admin" />;
  }

  if (userType === 'Needy') {
    return <Redirect href="/(tabs)" />;
  }

  // Default fallback to tabs
  return <Redirect href="/(tabs)" />;
}
