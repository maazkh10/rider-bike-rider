# Android Expo Push Notification Handoff

## Scope

This branch prepares the Rider Android frontend for Expo Push Service. iOS/APNs work is explicitly out of scope for this phase. The app remains on Expo SDK 54 and keeps the existing Spring Boot + Neon backend.

## Existing app identity

- Expo project: `bike-rider`
- EAS project ID: `5aecd6b2-417b-4a0e-907e-845cbe92174a`
- Android package: `com.bikerider.rider`
- Expo notifications package: `~0.32.17`
- Backend base URL default: `https://rider-booking-app.onrender.com`, overridable by `EXPO_PUBLIC_API_URL`

The EAS project ID is now in the root `app.json` under `expo.extra.eas.projectId`. Token generation resolves it from `EXPO_PUBLIC_EAS_PROJECT_ID`, `Constants.easConfig`, or `Constants.expoConfig.extra.eas`.

## Frontend work on this branch

- Reuses the existing `src/services/notifications.js` notification service and `expo-notifications` dependency.
- Creates Android channels `ride-requests` and `ride-status`.
- Requests notification permission on a physical device.
- Obtains an Expo push token with the existing EAS project ID.
- Persists a stable installation ID (32 hexadecimal characters).
- Registers the device through authenticated `PUT /api/notifications/devices`.
- Retries registration after login and during Rider home initialization.
- Attempts authenticated device de-registration before clearing the JWT on logout.
- Adds root notification response listeners and routes a tapped `RIDE_REQUEST` toward the Deliveries screen.
- Configures the EAS preview and production profiles to produce installable Android APKs.

Registration contract expected by the current backend specification:

```http
PUT /api/notifications/devices
Authorization: Bearer <Rider JWT>
Content-Type: application/json
```

```json
{
  "app": "rider",
  "installationId": "<persistent 32-character ID>",
  "token": "<ExpoPushToken[...] or ExponentPushToken[...] >",
  "platform": "android"
}
```

Expected success response: `{"registered":true}`.

Logout contract:

```http
DELETE /api/notifications/devices/rider/{installationId}
Authorization: Bearer <Rider JWT>
```

Expected success response: `{"unregistered":true}`.

The app's Axios client attaches the current JWT automatically. Registration errors are best-effort and must not block login or ride functionality.

## Firebase / EAS work required from project owner

Remote Android push requires FCM V1 credentials configured for the same Expo project.

1. Confirm/reuse the existing Firebase project; do not create a duplicate without approval.
2. Register Android package `com.bikerider.rider` in Firebase.
3. Download the matching `google-services.json` and provide it securely to the frontend maintainer so it can be placed at the project root.
4. Add `expo.android.googleServicesFile: "./google-services.json"` to root `app.json` once that file is available.
5. Upload the matching Firebase **FCM V1 service-account JSON** to the existing Expo/EAS project credentials.
6. Never commit or bundle the private service-account JSON, and never put it in an `EXPO_PUBLIC_*` variable.
7. Rebuild a native Android APK after adding Firebase configuration.

The public Android `google-services.json` and private Firebase service-account JSON are different files. The first configures the Android client; the second is a private server/provider credential used by EAS.

## Backend owner tasks / blockers

- Confirm which Render deployment and Neon branch are the actual live backend/database.
- Safely apply and verify the backend push migrations on the correct database after backup and schema review.
- Deploy the backend revision that implements the notification endpoints; production must not be assumed to have these routes until verified.
- Confirm `PUT /api/notifications/devices` and `DELETE /api/notifications/devices/rider/{installationId}` request/response contracts and JWT ownership.
- Confirm push job creation, worker operation, Expo push sending and receipts.
- Configure `EXPO_ACCESS_TOKEN` on the backend only if Expo enhanced push security is enabled. Never place it in the mobile app.
- Confirm the push payload includes `eventId`, `type`, `rideId`, and the visible title/body are sent by the backend.
- Provide exact pending-offer response and acceptance contract.
- Provide a persisted decline endpoint or explicitly agree that decline remains a local dismiss for this phase. Do not call the accepted-ride cancellation endpoint for a pending offer.
- The pending-offer API currently returns at most ten entries and has no exact-offer lookup endpoint. The backend should consider an exact lookup endpoint so the app can safely open the ride identified by the notification.
- Keep `EXPO_PUSH_ENABLED` disabled until migrations, token registration and provider configuration have been verified.

## Remaining frontend work before declaring complete

- Implement exact pending-offer hydration from `GET /api/notifications/ride-requests` and match by the tapped `rideId`; never substitute another ride.
- Handle cold-start notification taps while signed in or signed out, revalidating against the current authenticated Rider.
- Verify event de-duplication between WebSocket and remote push.
- Reconcile any notification event IDs with the backend payload.
- Add/verify Android Firebase client config when the owner supplies `google-services.json`.

## Build and test

A new APK is required after native notification/Firebase configuration changes. Expo Go is not sufficient for remote push testing on current Expo SDKs.

Test on a physical Android phone:
1. Install a new preview APK.
2. Grant Android notification permission.
3. Log in and confirm the backend returns `registered: true`.
4. Have backend verify the device row is owned by the correct Rider.
5. Trigger a real ride request from Admin.
6. Verify push delivery in foreground, background and when normally closed.
7. Tap the notification and verify the exact pending ride is loaded.
8. Test expired/cancelled/already-accepted rides, logout, account switching and token renewal.
9. Regress existing booking, OTP, payment, location and ride-completion behavior.

No real-device delivery is claimed until these tests are performed. Android force-stop through system settings is a separate case from normally closing/backgrounding the app.

## Not in scope for this phase

- iOS/APNs credentials, Apple Developer membership or iPhone build/testing.
- Admin frontend changes.
- Production Render deployment or Neon migrations by the Rider frontend developer.
