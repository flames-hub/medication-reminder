import './src/i18n';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from './src/db/database';
import { useMedicationStore } from './src/store/medicationStore';
import { useSettingsStore } from './src/store/settingsStore';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [ready, setReady] = useState(false);
  const { loadMedications, loadTodaySchedule } = useMedicationStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadSettings(), getDatabase()]);
        await loadMedications();
        await loadTodaySchedule();
        if (Constants.appOwnership !== 'expo') {
          const { setupNotificationHandler, requestNotificationPermission } =
            await import('./src/utils/notifications');
          await setupNotificationHandler();
          requestNotificationPermission().catch(() => {});
        }
      } catch (err) {
        console.error('App init error:', err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
