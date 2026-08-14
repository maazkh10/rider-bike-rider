import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "../utils/authToken";
import api from "./api";

// ======================================================
// AUTH CONFIG
// ======================================================

const authConfig = async () => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Authentication session not found.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};

// ======================================================
// PROFILE
// ======================================================

export const getProfile = async () => {
  const response = await api.get(
    "/api/profile/me",
    await authConfig()
  );

  return response.data;
};

// ======================================================
// RIDES
// ======================================================

export const getRides = async () => {
  const response = await api.get(
    "/api/profile/me/rides",
    await authConfig()
  );

  return response.data;
};

// ======================================================
// ACTIVE RIDE
// ======================================================

export const getActiveRideProfile = async () => {
  const response = await api.get(
    "/api/profile/me/active-ride",
    await authConfig()
  );

  return response.data;
};

// ======================================================
// INVOICES
// ======================================================

export const getInvoices = async () => {
  const response = await api.get(
    "/api/profile/me/invoices",
    await authConfig()
  );

  return response.data;
};

// ======================================================
// RIDER LOCATION
// ======================================================

export const getRiderLocation = async () => {
  const response = await api.get(
    "/api/profile/me/rider-location",
    await authConfig()
  );

  return response.data;
};

// ======================================================
// VERIFICATION DETAILS
// ======================================================

export const getVerificationDetails = async () => {
  const response = await api.get(
    "/api/profile/me/verification-details",
    await authConfig()
  );

  return response.data;
};

// ======================================================
// RIDER STATUS
// AVAILABLE / OFFLINE
// ======================================================

export const updateRiderStatus = async (status) => {
  const normalized = String(status || "").toUpperCase();

  if (!["AVAILABLE", "OFFLINE"].includes(normalized)) {
    throw new Error(
      "Rider status must be AVAILABLE or OFFLINE."
    );
  }

  console.log("");
  console.log("==========================================");
  console.log("🔄 UPDATING RIDER STATUS");
  console.log("STATUS:", normalized);
  console.log("==========================================");

  const config = await authConfig();

  const response = await api.patch(
    "/rider/status",
    null,
    {
      ...config,
      params: {
        status: normalized,
      },
    }
  );

  console.log(
    "✅ RIDER STATUS UPDATED:",
    response?.data
  );

  return response.data;
};

// ======================================================
// CREATE RIDER PROFILE
// ======================================================

export const createOwnRiderProfile = async ({
  name,
  mobileNumber,
  status = "AVAILABLE",
}) => {
  if (!name?.trim()) {
    throw new Error("Rider name is required.");
  }

  if (!mobileNumber?.trim()) {
    throw new Error(
      "Rider mobile number is required."
    );
  }

  const response = await api.post(
    "/rider",
    {
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
      status: String(status).toUpperCase(),
    },
    await authConfig()
  );

  return response.data;
};

// ======================================================
// SAVE RIDER GPS LOCATION
// ======================================================
//
// BACKEND:
// POST /rider/save/location
//
// BODY:
// {
//   latitude: number,
//   longitude: number
// }
//
// The technical reference says this creates/saves a
// fresh GPS row for the rider and does NOT require
// an active ride.
// ======================================================

export const saveCurrentRiderLocation = async (
  latitude,
  longitude
) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat)) {
    throw new Error("Invalid rider latitude.");
  }

  if (!Number.isFinite(lon)) {
    throw new Error("Invalid rider longitude.");
  }

  if (lat < -90 || lat > 90) {
    throw new Error("Latitude is outside valid range.");
  }

  if (lon < -180 || lon > 180) {
    throw new Error("Longitude is outside valid range.");
  }

  console.log("");
  console.log("==========================================");
  console.log("📡 SAVING RIDER LOCATION");
  console.log("==========================================");
  console.log("LATITUDE:", lat);
  console.log("LONGITUDE:", lon);
  console.log("ENDPOINT: POST /rider/save/location");
  console.log("==========================================");

  try {
    const config = await authConfig();

    const response = await api.post(
      "/rider/save/location",
      {
        latitude: lat,
        longitude: lon,
      },
      config
    );

    console.log("");
    console.log("==========================================");
    console.log("✅ RIDER LOCATION SAVED");
    console.log("==========================================");
    console.log("LAT:", lat);
    console.log("LON:", lon);
    console.log(
      "SERVER:",
      JSON.stringify(
        response?.data,
        null,
        2
      )
    );
    console.log("==========================================");

    // Keep latest location locally too.
    await AsyncStorage.setItem(
      "lastRiderLatitude",
      String(lat)
    );

    await AsyncStorage.setItem(
      "lastRiderLongitude",
      String(lon)
    );

    await AsyncStorage.setItem(
      "lastRiderLocationAt",
      String(Date.now())
    );

    return response.data;
  } catch (error) {
    console.log("");
    console.log("==========================================");
    console.log("❌ RIDER LOCATION SAVE FAILED");
    console.log("==========================================");
    console.log(
      "STATUS:",
      error?.response?.status
    );
    console.log(
      "DATA:",
      JSON.stringify(
        error?.response?.data,
        null,
        2
      )
    );
    console.log(
      "MESSAGE:",
      error?.message
    );
    console.log("==========================================");

    throw error;
  }
};

// ======================================================
// RIDER HISTORY
// ======================================================

export const getRideHistory = async () => {
  const rides = await getRides();

  return Array.isArray(rides)
    ? rides
    : [];
};