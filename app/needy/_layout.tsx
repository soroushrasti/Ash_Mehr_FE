import { Stack } from 'expo-router';

export default function NeedyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="verify-sms" />
      <Stack.Screen name="verify-goods" />
      <Stack.Screen name="info-needy" />
    </Stack>
  );
}

