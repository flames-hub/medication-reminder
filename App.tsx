import './src/i18n';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from './src/db/database';
import { useMedicationStore } from './src/store/medicationStore';
import { useSettingsStore } from './src/store/settingsStore';
import { AppNavigator } from './src/navigation/AppNavigator';

const REVENUECAT_API_KEY_IOS = 'appl_PLACEHOLDER_KEY';
const REVENUECAT_API_KEY_ANDROID = 'goog_PLACEHOLDER_KEY';

async function initRevenueCat(setIsPro: (v: boolean) => void) {
  if (Constants.appOwnership === 'expo') return;
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
    Purchases.configure({ apiKey });
    const customerInfo = await Purchases.getCustomerInfo();
    setIsPro(customerInfo.entitlements.active['pro'] != null);
  } catch (rcErr) {
    console.warn('RevenueCat init failed:', rcErr);
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const { loadMedications, loadTodaySchedule } = useMedicationStore();
  const { loadSettings, setIsPro } = useSettingsStore();

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
        await initRevenueCat(setIsPro);
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
