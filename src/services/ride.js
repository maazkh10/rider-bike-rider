import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "../utils/authToken";
import api from "./api";

// ==========================================================
// RIDER AUTH CONFIG
// ==========================================================

const getAuthConfig = async () => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Rider authentication token not found.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};

// ==========================================================
// GET ACTIVE RIDE
// Backend resolves the current rider from the JWT.
// Do not send riderId/rideId.
// ==========================================================

export const getActiveRide = async () => {
  const config = await getAuthConfig();
  return api.get("/api/profile/me/active-ride", config);
};

// ==========================================================
// ACCEPT RIDE
// ==========================================================

export const acceptRide = async (rideId, riderId) => {
  const numericRideId = Number(rideId);
  const numericRiderId = Number(riderId);

  if (!Number.isInteger(numericRideId) || numericRideId <= 0) {
    throw new Error("Invalid ride ID.");
  }

  if (!Number.isInteger(numericRiderId) || numericRiderId <= 0) {
    throw new Error("Invalid rider ID.");
  }

  const config = await getAuthConfig();

  console.log("==========================================");
  console.log("📡 ACCEPT RIDE");
  console.log("RIDE ID:", numericRideId);
  console.log("RIDER ID:", numericRiderId);
  console.log("==========================================");

  const response = await api.post(
    "/ride/accept",
    null,
    {
      ...config,
      params: {
        rideId: numericRideId,
        riderId: numericRiderId,
      },
    }
  );

  console.log("✅ ACCEPT RIDE:", response.status, response.data);
  return response;
};

// ==========================================================
// VERIFY START OTP
// ACCEPTED -> STARTED
// ==========================================================

export const verifyRideOtp = async (rideId, riderId, otp) => {
  const numericRideId = Number(rideId);
  const numericRiderId = Number(riderId);
  const cleanOtp = String(otp ?? "").trim();

  if (!Number.isInteger(numericRideId) || numericRideId <= 0) {
    throw new Error("Invalid ride ID.");
  }

  if (!Number.isInteger(numericRiderId) || numericRiderId <= 0) {
    throw new Error("Invalid rider ID.");
  }

  if (!/^\d{4}$/.test(cleanOtp)) {
    throw new Error("Enter the 4-digit OTP.");
  }

  const config = await getAuthConfig();

  console.log("🔐 VERIFY START OTP", {
    rideId: numericRideId,
    riderId: numericRiderId,
  });

  return api.post(
    "/ride/verify-otp",
    null,
    {
      ...config,
      params: {
        rideId: numericRideId,
        riderId: numericRiderId,
        otp: cleanOtp,
      },
    }
  );
};

// ==========================================================
// END RIDE
// IMPORTANT: Current backend has NO end-ride OTP endpoint.
// The deployed API accepts only rideId + riderId here.
// ==========================================================

export const endRide = async (rideId, riderId) => {
  const numericRideId = Number(rideId);
  const numericRiderId = Number(riderId);

  if (!Number.isInteger(numericRideId) || numericRideId <= 0) {
    throw new Error("Invalid ride ID.");
  }

  if (!Number.isInteger(numericRiderId) || numericRiderId <= 0) {
    throw new Error("Invalid rider ID.");
  }

  const config = await getAuthConfig();

  console.log("🏁 END RIDE", {
    rideId: numericRideId,
    riderId: numericRiderId,
  });

  return api.post(
    "/ride/end",
    null,
    {
      ...config,
      params: {
        rideId: numericRideId,
        riderId: numericRiderId,
      },
    }
  );
};

// ==========================================================
// RIDER CANCEL
// ==========================================================

export const cancelRideByRider = async (rideId, riderId) => {
  const numericRideId = Number(rideId);
  const numericRiderId = Number(riderId);

  if (!Number.isInteger(numericRideId) || numericRideId <= 0) {
    throw new Error("Invalid ride ID.");
  }

  if (!Number.isInteger(numericRiderId) || numericRiderId <= 0) {
    throw new Error("Invalid rider ID.");
  }

  const config = await getAuthConfig();

  return api.post(
    "/ride/rider-cancel",
    null,
    {
      ...config,
      params: {
        rideId: numericRideId,
        riderId: numericRiderId,
      },
    }
  );
};
