import { useAuth } from '@/components/AuthContext';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function Index() {
  const { userType, isLoading } = useAuth();

  // Show loading screen while checking authentication state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <ThemedText style={{ marginTop: 16, fontSize: 16 }}>در حال بررسی وضعیت ورود...</ThemedText>
      </View>
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

  // Default fallback to tabs
  return <Redirect href="/(tabs)" />;
}
