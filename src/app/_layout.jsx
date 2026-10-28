import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { startPushLifecycle } from "../services/pushClient";
import api from "../services/api";
import ScreenBackButton from "../components/common/ScreenBackButton";

// IMPORTANT:
// Import this module at startup so expo-task-manager registers the
// background location task before Location.startLocationUpdatesAsync()
// is called.
import "../services/liveLocation.service";

export default function RootLayout() {
  useEffect(() => {
    let disposed = false, cleanup = () => {};
    startPushLifecycle(async data => {
      try {
        const response = await api.get("/api/profile/me/active-ride");
        const ride = response.data.activeRide;
        if (ride && Number(ride.rideId) === data.rideId)
          router.push({ pathname: ["STARTED", "AWAITING_PAYMENT"].includes(ride.rideStatus) ? "/deliveries/delivery-map" : "/deliveries/pickup-map", params: { id: String(data.rideId) } });
        else router.push({ pathname: "/(tabs)/home", params: { notification: String(data.eventId || data.rideId), notificationRideId: String(data.rideId) } });
      } catch { /* Keep the current screen while the network is unavailable. */ }
    }).then(remove => { if (disposed) remove(); else cleanup = remove; }).catch(() => {});
    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="explore" options={{ headerShown: true, title: "Explore", headerLeft: () => <ScreenBackButton fallback="/(tabs)/home" /> }} />
      <Stack.Screen name="modal" options={{ headerShown: true, title: "", headerLeft: () => <ScreenBackButton fallback="/(tabs)/home" /> }} />
    </Stack>
  );
}
