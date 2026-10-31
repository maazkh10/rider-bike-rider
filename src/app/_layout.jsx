import { useEffect } from "react";
import { Stack, router } from "expo-router";
import {
  addNotificationListeners,
  configureNotificationChannels,
  registerForNotifications,
} from "../services/notifications";

// Register the background location task before it is started elsewhere.
import "../services/liveLocation.service";

const routeFromNotification = (response) => {
  const data = response?.notification?.request?.content?.data || {};
  const type = String(data.type || "").toUpperCase();
  const rideId = data.rideId ?? data.deliveryId;

  if (!rideId || type !== "RIDE_REQUEST") return;

  // Open the app's pending-offer list. Do not jump to an active-ride-only
  // screen: a newly offered ride has not necessarily been accepted yet.
  router.push({
    pathname: "/deliveries",
    params: { notificationRideId: String(rideId) },
  });
};

export default function RootLayout() {
  useEffect(() => {
    let active = true;
    let removeListeners = () => {};

    (async () => {
      try {
        await configureNotificationChannels();
        // Device registration occurs after Rider login, when the JWT exists.
      } catch (error) {
        if (__DEV__) console.log("Notification channel setup:", error?.message);
      }

      const cleanup = await addNotificationListeners(
        (notification) => {
          if (__DEV__) {
            console.log("Foreground push received", {
              identifier: notification?.request?.identifier,
            });
          }
        },
        routeFromNotification
      );

      if (active) removeListeners = cleanup;
      else cleanup();

      try {
        const initial = await (await import("expo-notifications"))
          .getLastNotificationResponseAsync();
        if (active && initial) routeFromNotification(initial);
      } catch (error) {
        if (__DEV__) console.log("Initial notification response:", error?.message);
      }
    })();

    return () => {
      active = false;
      removeListeners();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
