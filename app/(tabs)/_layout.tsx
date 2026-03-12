import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { C, F } from "@/constants/theme";

function ClassicTabLayout() {
  const { t } = useLanguage();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   C.gold,
        tabBarInactiveTintColor: C.goldDark,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: C.tabBar,
          borderTopWidth: 1,
          borderTopColor: C.gold,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: C.tabBar }]} />
        ),
        tabBarLabelStyle: {
          fontFamily: F.label,
          fontSize: 10,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require("@expo/vector-icons");
            return <Ionicons name="home" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: t("cards"),
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require("@expo/vector-icons");
            return <Ionicons name="albums" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="story"
        options={{
          title: t("story"),
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require("@expo/vector-icons");
            return <Ionicons name="book" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("chat"),
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require("@expo/vector-icons");
            return <Ionicons name="chatbubble" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="speak"
        options={{
          title: t("speak"),
          tabBarIcon: ({ color, size }) => {
            const { Ionicons } = require("@expo/vector-icons");
            return <Ionicons name="mic" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return <ClassicTabLayout />;
}
