# Production readiness — Rider app

This client follows the supplied Rider Booking API reference and keeps the backend as the source of truth for ride ownership and lifecycle.

## Implemented
- JWT storage moved to Expo SecureStore with legacy-token migration.
- Configurable API/WebSocket base URL.
- Active-ride recovery on app startup/resume.
- STOMP ride request subscription with reconnect.
- Local ride-request notification when the live connection is available.
- Acceptance -> ACCEPTED state persisted locally immediately.
- Background location starts at acceptance and continues through STARTED.
- Background task sends only latitude/longitude to `/rider/fetch/livelocation`.
- Start OTP is verified by `/ride/verify-otp`; no frontend-only success is allowed.
- STARTED navigation opens Google Maps and the destination map.
- Ride completion stops background location and clears active ride state.
- Android foreground location service configuration and iOS background location mode.
- EAS build profiles and environment example.

## Important OS/backend limitations
A mobile app cannot guarantee remote notifications after it has been force-quit when the backend only exposes STOMP/WebSocket delivery. The supplied API reference has no push-token registration or push-delivery endpoint. Add APNs/FCM/Expo push delivery on the backend for guaranteed closed-app ride requests.

Background location is also subject to Android/iOS OS policies. Users must grant the required background permission; force-quitting an app can stop background execution depending on the OS.

The supplied backend has no end-ride OTP endpoint. The current `/ride/end` endpoint directly completes a STARTED ride. A real end OTP requires a backend-generated OTP plus a verification endpoint.
