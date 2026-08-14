import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import {
    saveCurrentRiderLocation,
} from "./profile";

let watcher = null;
let backupTimer = null;

let trackingStarted = false;
let savingLocation = false;

// ======================================================
// GET CURRENT GPS
// ======================================================

const getCurrentGPS = async () => {
  const enabled =
    await Location.hasServicesEnabledAsync();

  if (!enabled) {
    throw new Error(
      "Location services are disabled."
    );
  }

  const permission =
    await Location.getForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    const requested =
      await Location.requestForegroundPermissionsAsync();

    if (requested.status !== "granted") {
      throw new Error(
        "Location permission was denied."
      );
    }
  }

  const location =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

  const latitude =
    location?.coords?.latitude;

  const longitude =
    location?.coords?.longitude;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    throw new Error(
      "Device returned invalid GPS coordinates."
    );
  }

  return {
    latitude,
    longitude,
    accuracy:
      location?.coords?.accuracy,
  };
};

// ======================================================
// SAVE CURRENT GPS
// ======================================================

export const saveLatestGPSLocation = async () => {
  if (savingLocation) {
    console.log(
      "⏭️ LOCATION SAVE ALREADY IN PROGRESS"
    );

    return;
  }

  try {
    savingLocation = true;

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "📍 GETTING CURRENT RIDER GPS"
    );
    console.log(
      "=========================================="
    );

    const gps =
      await getCurrentGPS();

    console.log(
      "📍 LAT:",
      gps.latitude
    );

    console.log(
      "📍 LON:",
      gps.longitude
    );

    console.log(
      "📍 ACCURACY:",
      gps.accuracy
    );

    await saveCurrentRiderLocation(
      gps.latitude,
      gps.longitude
    );

    console.log(
      "✅ GPS LOCATION SAVED TO DATABASE"
    );

    return gps;

  } catch (error) {
    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "❌ GPS LOCATION ERROR"
    );
    console.log(
      "STATUS:",
      error?.response?.status
    );
    console.log(
      "DATA:",
      error?.response?.data
    );
    console.log(
      "MESSAGE:",
      error?.message
    );
    console.log(
      "=========================================="
    );

    throw error;

  } finally {
    savingLocation = false;
  }
};

// ======================================================
// START RIDER LOCATION TRACKING
// ======================================================
//
// BEFORE RIDE:
//
// GPS watcher:
//   every ~10 seconds
//   OR ~10 metres movement
//
// Backup:
//
//   every 60 seconds
//
// This solves emulator situations where
// watchPositionAsync does not fire.
// ======================================================

export const startRiderLocationTracking =
  async () => {

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "🚀 STARTING RIDER LOCATION TRACKING"
    );
    console.log(
      "=========================================="
    );

    // ------------------------------------------
    // Don't start twice
    // ------------------------------------------

    if (trackingStarted) {
      console.log(
        "⚠️ LOCATION TRACKING ALREADY RUNNING"
      );

      return;
    }

    // ------------------------------------------
    // Permissions
    // ------------------------------------------

    let permission =
      await Location.getForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      permission =
        await Location.requestForegroundPermissionsAsync();
    }

    if (permission.status !== "granted") {
      console.log(
        "❌ LOCATION PERMISSION NOT GRANTED"
      );

      throw new Error(
        "Please allow location permission for the rider app."
      );
    }

    console.log(
      "✅ LOCATION PERMISSION GRANTED"
    );

    // ------------------------------------------
    // Stop old watcher if any
    // ------------------------------------------

    watcher?.remove?.();
    watcher = null;

    if (backupTimer) {
      clearInterval(backupTimer);
      backupTimer = null;
    }

    // ------------------------------------------
    // SAVE IMMEDIATELY
    // ------------------------------------------

    try {
      await saveLatestGPSLocation();
    } catch (error) {
      console.log(
        "⚠️ INITIAL LOCATION SAVE FAILED"
      );
    }

    // ------------------------------------------
    // WATCH GPS
    // ------------------------------------------

    watcher =
      await Location.watchPositionAsync(
        {
          accuracy:
            Location.Accuracy.High,

          // Android/iOS location update
          // approximately every 10 seconds.
          timeInterval: 10000,

          // Also trigger when moving 10 metres.
          distanceInterval: 10,
        },

        async ({ coords }) => {
          try {

            const activeRide =
              await AsyncStorage.getItem(
                "activeRide"
              );

            // Once ride is accepted,
            // liveLocation.service should
            // take over.
            if (activeRide) {
              console.log(
                "⏭️ ACTIVE RIDE EXISTS - PRE-RIDE TRACKER SKIPPED"
              );

              return;
            }

            const latitude =
              coords?.latitude;

            const longitude =
              coords?.longitude;

            if (
              typeof latitude !== "number" ||
              typeof longitude !== "number"
            ) {
              return;
            }

            console.log("");
            console.log(
              "=========================================="
            );
            console.log(
              "📍 GPS LOCATION CHANGED"
            );
            console.log(
              "LAT:",
              latitude
            );
            console.log(
              "LON:",
              longitude
            );
            console.log(
              "=========================================="
            );

            await saveCurrentRiderLocation(
              latitude,
              longitude
            );

            console.log(
              "✅ LOCATION CHANGE SAVED"
            );

          } catch (error) {

            console.log(
              "❌ GPS WATCH SAVE ERROR:",
              error?.response?.data ||
              error?.message
            );

          }
        }
      );

    console.log(
      "✅ GPS WATCHER STARTED"
    );

    // ------------------------------------------
    // BACKUP TIMER
    // ------------------------------------------
    //
    // This is deliberately 60 seconds.
    //
    // The backend needs a fresh location.
    // ------------------------------------------

    backupTimer =
      setInterval(
        async () => {

          try {

            const activeRide =
              await AsyncStorage.getItem(
                "activeRide"
              );

            if (activeRide) {
              console.log(
                "⏭️ ACTIVE RIDE - BACKUP GPS SKIPPED"
              );

              return;
            }

            console.log("");
            console.log(
              "=========================================="
            );
            console.log(
              "⏰ 60 SECOND GPS BACKUP"
            );
            console.log(
              "=========================================="
            );

            await saveLatestGPSLocation();

          } catch (error) {

            console.log(
              "❌ BACKUP GPS ERROR:",
              error?.response?.data ||
              error?.message
            );

          }
        },
        60 * 1000
      );

    trackingStarted = true;

    console.log(
      "✅ RIDER LOCATION TRACKING ACTIVE"
    );

    console.log(
      "📡 GPS watcher: 10 sec / 10 metres"
    );

    console.log(
      "📡 Backup database update: 60 sec"
    );
  };

// ======================================================
// STOP TRACKING
// ======================================================

export const stopRiderLocationTracking =
  () => {

    console.log(
      "🛑 STOPPING RIDER LOCATION TRACKING"
    );

    watcher?.remove?.();
    watcher = null;

    if (backupTimer) {
      clearInterval(backupTimer);
      backupTimer = null;
    }

    trackingStarted = false;

    console.log(
      "✅ RIDER LOCATION TRACKING STOPPED"
    );
  };

// ======================================================
// CHECK TRACKING
// ======================================================

export const isRiderLocationTracking =
  () => {
    return trackingStarted;
  };