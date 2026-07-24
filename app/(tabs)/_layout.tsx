import { Redirect, Tabs } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
} from "react-native";

import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import {
  Layout,
  Spacing,
} from "@/constants/spacing";

const TAB_ICONS: Record<
  string,
  {
    active: string;
    inactive: string;
  }
> = {
  index: {
    active: "🏠",
    inactive: "⌂",
  },
  trips: {
    active: "🧳",
    inactive: "▣",
  },
  discover: {
    active: "✨",
    inactive: "✧",
  },
  closet: {
    active: "👗",
    inactive: "♢",
  },
  profile: {
    active: "👤",
    inactive: "○",
  },
};

interface TabIconProps {
  routeName: string;
  focused: boolean;
}

function TabIcon({
  routeName,
  focused,
}: TabIconProps) {
  const icons = TAB_ICONS[routeName] ?? {
    active: "●",
    inactive: "○",
  };

  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.icon,
        focused && styles.activeIcon,
      ]}
    >
      {focused ? icons.active : icons.inactive}
    </Text>
  );
}

export default function TabsLayout() {
  const { loading, mode } = useAuth();

  if (loading) {
    return null;
  }

  if (mode === "signed-out") {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: "700",
        },

        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,

        tabBarLabelStyle: styles.label,

        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height:
            Platform.OS === "ios"
              ? Layout.tabBarHeight
              : 70,
          paddingTop: Spacing.xs,
          paddingBottom:
            Platform.OS === "ios"
              ? Spacing.lg
              : Spacing.sm,
        },

        tabBarIcon: ({ focused }) => (
          <TabIcon
            routeName={route.name}
            focused={focused}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
        }}
      />

      <Tabs.Screen
        name="closet"
        options={{
          title: "Closet",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 21,
    lineHeight: 26,
    opacity: 0.8,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});