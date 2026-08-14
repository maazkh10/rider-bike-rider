import axios from "axios";
import api from "./api";
import { getAuthToken, setAuthToken, clearAuthToken } from "../utils/authToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { stopLiveLocationTracking, clearActiveRideState } from "./liveLocation.service";
import { disconnectRideSocket } from "./notifications";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://rider-booking-app.onrender.com";

export const register = async (data) => {
  const response = await axios.post(`${BASE_URL}/register`, data, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  return response.data;
};

export const login = async ({ username, password }) => {
  const response = await api.post("/login", { username, password });
  return response.data;
};

/**
 * The reference says /login is currently protected by SecurityConfig and
 * returns 403 for anonymous callers. During that deployed state, the guide
 * explicitly uses the confirmation token or /sendJWT for the test flow.
 * We try the real login first, then use the documented development fallback.
 */
export const loginWithCurrentBackend = async (username, password) => {
  try {
    const result = await login({ username, password });
    if (!result?.token) throw new Error("Login response did not contain a token.");
    await setAuthToken(result.token);
    return result;
  } catch (error) {
    if (error?.response?.status !== 403) throw error;

    const devFallback =
      process.env.EXPO_PUBLIC_ALLOW_DEV_JWT_LOGIN !== "false";

    if (!devFallback) throw error;

    const response = await axios.get(
      `${BASE_URL}/sendJWT?username=${encodeURIComponent(username)}`
    );
    if (!response?.data?.token) {
      throw new Error("The development JWT endpoint did not return a token.");
    }
    await setAuthToken(response.data.token);
    return response.data;
  }
};

export const sendJWT = async (username) => {
  const response = await axios.get(
    `${BASE_URL}/sendJWT?username=${encodeURIComponent(username)}`
  );
  return response.data;
};

export const confirmEmailToken = async (email, otp) => {
  const response = await axios.get(
    `${BASE_URL}/register/confirmToken?token=${encodeURIComponent(String(otp).trim())}`
  );
  return response.data;
};

export const verifyEmail = async (email) => {
  const response = await axios.get(
    `${BASE_URL}/register/verifyEmail?emailAddress=${encodeURIComponent(email)}`
  );
  return response.data;
};

export const getMyProfile = async (token = null) => {
  const authToken = token || (await getAuthToken());
  if (!authToken) throw new Error("Authentication session not found.");

  return (
    await api.get("/api/profile/me", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  ).data;
};

export const createRider = async (riderPayload, token = null) => {
  const authToken = token || (await getAuthToken());
  if (!authToken) throw new Error("Authentication session not found.");

  // The backend explicitly rejects userId in this body. Ownership comes from JWT.
  return (
    await api.post("/rider", {
      name: String(riderPayload?.name || "").trim(),
      mobileNumber: String(riderPayload?.mobileNumber || "").trim(),
      status: String(riderPayload?.status || "AVAILABLE").toUpperCase(),
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  ).data;
};

export const submitVerification = async (riderId, data, token = null) => {
  const authToken = token || (await getAuthToken());
  if (!authToken) throw new Error("Authentication session not found.");
  if (!riderId) throw new Error("Rider ID is required.");

  return (
    await api.post(`/rider/${Number(riderId)}/verification-details`, data, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  ).data;
};

export const saveRiderLocation = async (latitude, longitude, token = null) => {
  const authToken = token || (await getAuthToken());
  if (!authToken) throw new Error("Authentication session not found.");

  return (
    await api.post("/rider/save/location", {
      latitude: Number(latitude),
      longitude: Number(longitude),
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  ).data;
};

export const getRiderHistory = async (riderId, token = null) => {
  // The frontend should prefer /api/profile/me/rides because the server
  // resolves ownership from JWT. Keep this endpoint only for compatibility.
  const authToken = token || (await getAuthToken());
  if (!authToken) throw new Error("Authentication session not found.");

  return (
    await api.get("/api/profile/me/rides", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  ).data;
};

export default api;


export const logout = async () => {
  await disconnectRideSocket().catch(() => {});
  await stopLiveLocationTracking().catch(() => {});
  await clearActiveRideState().catch(() => {});

  // Clear local session/cache only. There is no logout endpoint in the
  // provided backend reference, so no fake API request is made.
  await clearAuthToken();
  await AsyncStorage.multiRemove([
    "userId",
    "riderId",
    "activeRide",
    "pushToken",
    "rideEvents",
  ]);
};
