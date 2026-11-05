import * as Haptics from "expo-haptics";
import { Redirect, Tabs } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { ActivityIndicator, Platform, View } from "react-native";
import { FloatingTabBar } from "../../components/FloatingTabBar";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/theme";

function tabHaptic() {
  void Haptics.selectionAsync();
}

function AndroidTabs() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="log" options={{ title: "Log" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

function IosTabs() {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={colors.primary}
      iconColor={{ default: colors.tabInactive, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.tabInactive, fontSize: 11, fontWeight: "500" },
        selected: { color: colors.primary, fontSize: 11, fontWeight: "600" },
      }}
    >
      <NativeTabs.Trigger name="index" listeners={{ tabPress: tabHaptic }}>
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "sun.max", selected: "sun.max.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="log" listeners={{ tabPress: tabHaptic }}>
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights" listeners={{ tabPress: tabHaptic }}>
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.xyaxis.line" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" listeners={{ tabPress: tabHaptic }}>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)/login" />;
  if (!user.profile?.onboardingComplete) {
    return <Redirect href="/(onboarding)/setup" />;
  }

  return Platform.OS === "ios" ? <IosTabs /> : <AndroidTabs />;
}
