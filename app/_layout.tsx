/** Root Layout（端自身骨架）· Stack：启动页（index）+ 登录页（login） */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
