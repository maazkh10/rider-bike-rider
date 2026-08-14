import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { registerForNotifications, addNotificationListeners } from "../services/notifications";

// IMPORTANT:
// Import this module at startup so expo-task-manager registers the
// background location task before Location.startLocationUpdatesAsync()
// is called.
import "../services/liveLocation.service";

export default function RootLayout() {
  useEffect(() => {
    registerForNotifications();

    let removeNotificationListeners = () => {};

    addNotificationListeners(
      (notification) => {
        if (__DEV__) {
          console.log("Foreground Notification Received:", notification);
        }
      },
      (response) => {
        const data = response?.notification?.request?.content?.data || {};
        const deliveryId = data?.deliveryId || data?.rideId;

        if (deliveryId) {
          router.push({
            pathname: "/deliveries/pickup-map",
            params: { id: String(deliveryId) },
          });
        }
      }
    ).then((cleanup) => {
      removeNotificationListeners = cleanup;
    });

    return () => {
      removeNotificationListeners();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
