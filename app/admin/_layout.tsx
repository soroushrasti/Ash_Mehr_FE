import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register/select-role" />
      <Stack.Screen name="register/form" />
      <Stack.Screen name="register/map" />
      <Stack.Screen name="register/confirm" />
      <Stack.Screen name="register/admin-user" />
    </Stack>
  );
}

