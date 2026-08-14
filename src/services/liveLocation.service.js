import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import api from "./api";
import { getAuthToken } from "../utils/authToken";

export const LIVE_LOCATION_TASK = "RIDER_BOOKING_LIVE_LOCATION_TASK";

const isActiveRideStatus = (ride) => {
  const status = String(
    ride?.rideStatus ?? ride?.status ?? ""
  ).toUpperCase();
  return status === "ACCEPTED" || status === "STARTED";
};

const sendLocation = async (latitude, longitude) => {
  const token = await getAuthToken();
  if (!token) return null;

  return api.post(
    "/rider/fetch/livelocation",
    {
      latitude: Number(latitude),
      longitude: Number(longitude),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
};

if (!TaskManager.isTaskDefined(LIVE_LOCATION_TASK)) {
  TaskManager.defineTask(LIVE_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      if (__DEV__) console.log("Background location task:", error.message);
      return;
    }

    const latest = data?.locations?.at?.(-1) || data?.locations?.[data?.locations?.length - 1];
    const coords = latest?.coords;

    if (
      !coords ||
      !Number.isFinite(coords.latitude) ||
      !Number.isFinite(coords.longitude)
    ) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem("activeRide");
      const activeRide = raw ? JSON.parse(raw) : null;

      // The backend derives riderId and active ride from the JWT.
      // Do not send rideId/riderId in the location body.
      if (!activeRide || !isActiveRideStatus(activeRide)) return;

      await sendLocation(coords.latitude, coords.longitude);
    } catch (taskError) {
      if (__DEV__) {
        console.log(
          "Background live location failed:",
          taskError?.response?.data || taskError?.message
        );
      }
    }
  });
}

export const setActiveRideState = async (ride) => {
  if (!ride) {
    await AsyncStorage.removeItem("activeRide");
    return;
  }

  await AsyncStorage.setItem(
    "activeRide",
    JSON.stringify({
      ...ride,
      rideId: Number(ride.rideId),
      riderId:
        ride.riderId != null ? Number(ride.riderId) : undefined,
      rideStatus: String(
        ride.rideStatus ?? ride.status ?? "ACCEPTED"
      ).toUpperCase(),
    })
  );
};

export const clearActiveRideState = async () => {
  await AsyncStorage.removeItem("activeRide");
};

export const getActiveRideState = async () => {
  const raw = await AsyncStorage.getItem("activeRide");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem("activeRide");
    return null;
  }
};

export const sendLiveLocation = async (latitude, longitude) => {
  const activeRide = await getActiveRideState();
  if (!activeRide || !isActiveRideStatus(activeRide)) return null;
  return sendLocation(latitude, longitude);
};

export const startLiveLocationTracking = async () => {
  const foreground = await Location.requestForegroundPermissionsAsync();

  if (foreground.status !== "granted") {
    throw new Error("Foreground location permission is required.");
  }

  const background = await Location.requestBackgroundPermissionsAsync();

  if (background.status !== "granted") {
    throw new Error(
      "Background location permission is required for live ride tracking."
    );
  }

  // Send one location immediately so the admin does not wait for the next task.
  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  await sendLiveLocation(
    current.coords.latitude,
    current.coords.longitude
  );

  const started =
    await Location.hasStartedLocationUpdatesAsync(LIVE_LOCATION_TASK);

  if (started) return;

  await Location.startLocationUpdatesAsync(LIVE_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    deferredUpdatesInterval: 5000,
    deferredUpdatesDistance: 10,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Ride in progress",
      notificationBody: "Your live location is being shared with the booking admin.",
      notificationColor: "#6FAF00",
    },
  });
};

export const stopLiveLocationTracking = async () => {
  const started =
    await Location.hasStartedLocationUpdatesAsync(LIVE_LOCATION_TASK);

  if (started) {
    await Location.stopLocationUpdatesAsync(LIVE_LOCATION_TASK);
  }
};
