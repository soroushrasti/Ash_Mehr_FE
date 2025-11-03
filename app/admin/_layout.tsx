import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="plot-data" />
      <Stack.Screen name="admin-management" />
      <Stack.Screen name="info-management" />
      <Stack.Screen name="needy-management" />
      <Stack.Screen name="disconnected-needy-management" />
      <Stack.Screen name="register/admin-form" />
      <Stack.Screen name="register/needy-form" />
       <Stack.Screen name="register/map" />
        <Stack.Screen name="register/info-management" />
        <Stack.Screen name="register/admin-management" />
        <Stack.Screen name="register/needy-management" />
        <Stack.Screen name="register/disconnected-needy-management" />
        <Stack.Screen name="register/goods-management" />
      <Stack.Screen name="register/group-admin-form" />
      <Stack.Screen name="register/confirm" />
      <Stack.Screen name="admin-details/[id]" />
      <Stack.Screen name="edit-admin/[registerId]" />
      <Stack.Screen name="edit-good/[registerId]" />
      <Stack.Screen name="edit-needy/[registerId]" />
      <Stack.Screen name="needy-details/[id]" />
    </Stack>
  );
}

