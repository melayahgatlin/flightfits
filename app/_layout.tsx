import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
  );
}