import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { TodayScreen } from '../screens/TodayScreen';
import { MedicationListScreen } from '../screens/MedicationListScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  AddMedication: { medicationId?: string };
};

export type TabParamList = {
  Today: undefined;
  MedicationList: undefined;
  History: undefined;
  Settings: undefined;
};

const TAB_ICONS: Record<keyof TabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Today: { active: 'today', inactive: 'today-outline' },
  MedicationList: { active: 'medkit', inactive: 'medkit-outline' },
  History: { active: 'calendar', inactive: 'calendar-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        lazy: true,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: t('tabs.today'), tabBarLabel: t('tabs.today') }} />
      <Tab.Screen name="MedicationList" component={MedicationListScreen} options={{ title: t('tabs.medications'), tabBarLabel: t('tabs.medications') }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: t('tabs.history'), tabBarLabel: t('tabs.history') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings'), tabBarLabel: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, headerShadowVisible: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
