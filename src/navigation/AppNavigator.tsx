import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/theme';
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

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: t('tabs.today'), tabBarLabel: t('tabs.today') }} />
      <Tab.Screen name="MedicationList" component={MedicationListScreen} options={{ title: t('tabs.medications'), tabBarLabel: t('tabs.medications') }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: t('tabs.history'), tabBarLabel: t('tabs.history') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings'), tabBarLabel: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, headerShadowVisible: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
