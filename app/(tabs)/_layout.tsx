import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

function NativeTabLayoutFemale() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calories">
        <Icon sf={{ default: "flame", selected: "flame.fill" }} />
        <Label>Calories</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="steps">
        <Icon sf={{ default: "figure.walk", selected: "figure.walk" }} />
        <Label>Steps</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cycle">
        <Icon sf={{ default: "heart", selected: "heart.fill" }} />
        <Label>Cycle</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function NativeTabLayoutDefault() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calories">
        <Icon sf={{ default: "flame", selected: "flame.fill" }} />
        <Label>Calories</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="steps">
        <Icon sf={{ default: "figure.walk", selected: "figure.walk" }} />
        <Label>Steps</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const { profile } = useUser();
  const showCycle = profile?.gender === "female";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault,
        tabBarLabelStyle: {
          fontFamily: "Outfit_500Medium",
          fontSize: 11,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? Colors.dark.background : Colors.light.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calories"
        options={{
          title: "Calories",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "flame" : "flame-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="steps"
        options={{
          title: "Steps",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "walk" : "walk-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: "Cycle",
          href: showCycle ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { profile } = useUser();
  const showCycle = profile?.gender === "female";

  if (isLiquidGlassAvailable()) {
    return showCycle ? <NativeTabLayoutFemale /> : <NativeTabLayoutDefault />;
  }
  return <ClassicTabLayout />;
}
