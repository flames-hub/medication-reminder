import './src/i18n';  // must be first import
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from './src/db/database';
import { useMedicationStore } from './src/store/medicationStore';
import { useSettingsStore } from './src/store/settingsStore';
import { AppNavigator } from './src/navigation/AppNavigator';
// notifications lazy-loaded to avoid Expo Go crash

// Replace with actual RevenueCat API keys when available
const REVENUECAT_API_KEY_IOS = 'appl_PLACEHOLDER_KEY';
const REVENUECAT_API_KEY_ANDROID = 'goog_PLACEHOLDER_KEY';

async function initRevenueCat(setIsPro: (v: boolean) => void) {
  // Skip RevenueCat in Expo Go — native module not available
  if (Constants.appOwnership === 'expo') return;
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
    Purchases.configure({ apiKey });
    const customerInfo = await Purchases.getCustomerInfo();
    const isPro = customerInfo.entitlements.active['pro'] != null;
    setIsPro(isPro);
  } catch (rcErr) {
    console.warn('RevenueCat init failed:', rcErr);
  }
}

export default function App() {
  const [ready, setReady] = useState(false);
  const { loadMedications, loadTodaySchedule } = useMedicationStore();
  const { loadSettings, setIsPro } = useSettingsStore();

  useEffect(() => {
    async function init() {
      try {
        // 1. Load persisted settings
        await loadSettings();

        // 2. Initialize SQLite DB (creates tables if needed)
        await getDatabase();

        // 3. Load medications from DB
        await loadMedications();

        // 4. Load today's schedule
        await loadTodaySchedule();

        // 5. Setup notifications (skip in Expo Go)
        if (Constants.appOwnership !== 'expo') {
          const { setupNotificationHandler, requestNotificationPermission } = await import('./src/utils/notifications');
          await setupNotificationHandler();
          await requestNotificationPermission().catch(() => {});
        }

        // 6. Configure RevenueCat (skipped in Expo Go)
        await initRevenueCat(setIsPro);
      } catch (err) {
        console.error('App init error:', err);
      } finally {
        setReady(true);
      }
    }

    init();
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
