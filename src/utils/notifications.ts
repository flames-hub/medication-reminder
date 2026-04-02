// Lazy-load expo-notifications to avoid Hermes type crash in Expo Go
type NotificationsModule = typeof import('expo-notifications');
let _mod: NotificationsModule | null = null;

async function getNotifications(): Promise<NotificationsModule> {
  if (!_mod) {
    _mod = await import('expo-notifications');
  }
  return _mod;
}

export async function setupNotificationHandler() {
  try {
    const N = await getNotifications();
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      } as any),
    });
  } catch (err) {
    console.warn('Notification handler setup failed:', err);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const N = await getNotifications();
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDoseReminder(
  id: string,
  title: string,
  body: string,
  triggerDate: Date
): Promise<string> {
  const N = await getNotifications();
  return N.scheduleNotificationAsync({
    content: { title, body, data: { type: 'dose', id } },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  const N = await getNotifications();
  await N.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotification(identifier: string): Promise<void> {
  const N = await getNotifications();
  await N.cancelScheduledNotificationAsync(identifier);
}
