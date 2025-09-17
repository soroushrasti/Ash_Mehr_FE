import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register/admin-form" />
      <Stack.Screen name="register/needy-form" />
        <Stack.Screen name="register/map" />
        <Stack.Screen name="register/info-management" />
        <Stack.Screen name="register/admin-management" />
        <Stack.Screen name="register/needy-management" />
      <Stack.Screen name="register/group-admin-form" />
      <Stack.Screen name="register/confirm" />
    </Stack>
  );
}

