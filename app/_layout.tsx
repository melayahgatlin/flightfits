import { Stack } from 'expo-router';

import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#FFF9F6',
          },
          headerTintColor: '#221E1C',
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#FFF9F6',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Log in' }} />
        <Stack.Screen name="signup" options={{ title: 'Create account' }} />
        <Stack.Screen
          name="forgot-password"
          options={{ title: 'Forgot password' }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="create-trip"
          options={{
            title: 'Create Trip',
            presentation: 'modal',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="trip/[tripId]/index"
          options={{
            title: 'Trip Details',
            headerBackTitle: 'Trips',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
