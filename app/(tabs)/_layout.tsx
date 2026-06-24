import { useEffect, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import {
  House,
  ScanLine,
  MessageCircle,
  ClipboardList,
  User,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { ROUTES } from "@/constants/routes";
import { hasAuthSession } from "@/src/services/authSessionService";

const ACTIVE_COLOR   = COLORS.primary;
const INACTIVE_COLOR = "#8A8F9A";
const IS_WEB         = Platform.OS === "web";
const TAB_BAR_HEIGHT = IS_WEB ? 64 : 72;
const TAB_BAR_BOTTOM = Platform.OS === "ios" ? 16 : IS_WEB ? 20 : 12;
const TAB_BAR_MAX_WIDTH = 540;
const TAB_BAR_MIN_MARGIN = 18;

function TabBarGlass() {
  return (
    <View style={styles.glassLayer}>
      <BlurView intensity={IS_WEB ? 25 : 40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.glassTint} />
      <View style={styles.specularTop} />
    </View>
  );
}

function TabIcon({
  icon: Icon,
  focused,
  label,
}: {
  icon: React.ComponentType<{ color: string; size: number }>;
  focused: boolean;
  label: string;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Icon color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} size={focused ? 23 : 22} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const [authState, setAuthState] = useState<"checking" | "signed-in" | "signed-out">("checking");
  const tabBarWidth = IS_WEB
    ? Math.min(Math.max(width - TAB_BAR_MIN_MARGIN * 2, 0), TAB_BAR_MAX_WIDTH)
    : undefined;
  const tabBarTransform = IS_WEB && tabBarWidth
    ? [{ translateX: -tabBarWidth / 2 }]
    : undefined;

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const signedIn = await hasAuthSession().catch(() => false);
      if (mounted) setAuthState(signedIn ? "signed-in" : "signed-out");
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (authState === "checking") return null;
  if (authState === "signed-out") return <Redirect href={ROUTES.login} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: TAB_BAR_HEIGHT - 12,
          borderRadius: 16,
          marginHorizontal: 2,
        },
        tabBarIconStyle: {
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarBackground: () => <TabBarGlass />,
        tabBarStyle: {
          position:          "absolute",
          left:              IS_WEB ? "50%" : TAB_BAR_MIN_MARGIN,
          right:             IS_WEB ? undefined : TAB_BAR_MIN_MARGIN,
          width:             tabBarWidth,
          ...(tabBarTransform ? { transform: tabBarTransform } : {}),
          bottom:            TAB_BAR_BOTTOM,
          height:            TAB_BAR_HEIGHT,
          borderRadius:      TAB_BAR_HEIGHT / 2,
          paddingHorizontal: IS_WEB ? 8 : 6,
          paddingVertical:   6,
          backgroundColor:   "transparent",
          borderTopWidth:    0,
          borderWidth:       1,
          borderColor:       "rgba(255, 255, 255, 0.55)",
          overflow:          "hidden",
          shadowColor:       "#0F172A",
          shadowOpacity:     IS_WEB ? 0.10 : 0.14,
          shadowRadius:      IS_WEB ? 18 : 24,
          shadowOffset:      { width: 0, height: IS_WEB ? 6 : 8 },
          elevation:         18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={House} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ScanLine} focused={focused} label="Scan" />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-coach"
        options={{
          title: "Coach",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={MessageCircle} focused={focused} label="Coach" />
          ),
        }}
      />
      <Tabs.Screen
        name="meal-log"
        options={{
          title: "Log",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ClipboardList} focused={focused} label="Log" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={User} focused={focused} label="Profile" />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="analyzing"            options={{ href: null }} />
      <Tabs.Screen name="food-result"          options={{ href: null }} />
      <Tabs.Screen name="nutrition-history"    options={{ href: null }} />
      <Tabs.Screen name="meal-details"         options={{ href: null }} />
      <Tabs.Screen name="settings"             options={{ href: null }} />
      <Tabs.Screen name="smart-suggestions"    options={{ href: null }} />
      <Tabs.Screen name="nutrition-lessons"    options={{ href: null }} />
      <Tabs.Screen name="study-feedback"       options={{ href: null }} />
      <Tabs.Screen name="research-summary"     options={{ href: null }} />
      <Tabs.Screen name="dataset-contribution" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow:     "hidden",
    borderRadius: TAB_BAR_HEIGHT / 2,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  specularTop: {
    position:        "absolute",
    top:             0,
    left:            18,
    right:           18,
    height:          1,
    borderRadius:    999,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  tabItem: {
    alignItems:        "center",
    justifyContent:    "center",
    gap:               IS_WEB ? 3 : 4,
    paddingHorizontal: IS_WEB ? 14 : 11,
    paddingVertical:   IS_WEB ? 6 : 8,
    borderRadius:      16,
  },
  tabItemActive: {
    backgroundColor: "rgba(0, 128, 0, 0.14)",
    borderWidth:     1,
    borderColor:     "rgba(0, 128, 0, 0.18)",
  },
  tabLabel: {
    color:      INACTIVE_COLOR,
    fontSize:   10,
    fontFamily: FONTS.semiBold,
    lineHeight: IS_WEB ? 12 : 13,
  },
  tabLabelActive: {
    color:      ACTIVE_COLOR,
    fontFamily: FONTS.bold,
  },
});
