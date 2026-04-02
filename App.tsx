import './src/i18n';  // must be first import
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from './src/db/database';
import { useMedicationStore } from './src/store/medicationStore';
import { useSettingsStore } from './src/store/settingsStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { requestNotificationPermission, setupNotificationHandler } from './src/utils/notifications';

// Replace with actual RevenueCat API keys when available
const REVENUECAT_API_KEY_IOS = 'appl_PLACEHOLDER_KEY';
const REVENUECAT_API_KEY_ANDROID = 'goog_PLACEHOLDER_KEY';

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

        // 5. Setup notifications
        setupNotificationHandler();
        requestNotificationPermission().catch(() => {});

        // 6. Configure RevenueCat
        try {
          Purchases.configure({
            apiKey: REVENUECAT_API_KEY_IOS,
          });
          const customerInfo = await Purchases.getCustomerInfo();
          const isPro = customerInfo.entitlements.active['pro'] != null;
          setIsPro(isPro);
        } catch (rcErr) {
          console.warn('RevenueCat init failed (expected in dev without real key):', rcErr);
        }
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
