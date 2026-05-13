import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  ScanLine,
  MessageCircle,
  ClipboardList,
  User,
} from "lucide-react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#98A2B3",
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 76,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: FONTS.semiBold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan Meal",
          tabBarIcon: ({ color }) => <ScanLine color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="ai-coach"
        options={{
          title: "AI Coach",
          tabBarIcon: ({ color }) => (
            <MessageCircle color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="meal-log"
        options={{
          title: "Meal Log",
          tabBarIcon: ({ color }) => (
            <ClipboardList color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
      {/* Hidden screens accessible via navigation */}
      <Tabs.Screen
        name="analyzing"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="food-result"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="food-database"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="nutrition-history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="meal-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="smart-suggestions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="nutrition-lessons"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
