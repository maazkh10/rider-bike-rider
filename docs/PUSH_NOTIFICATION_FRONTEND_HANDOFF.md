# Rider push notification integration — handoff

## Branch
`maaz/push-notification-integration`

## Frontend changes
- Persist a per-installation ID and register the Expo push token using authenticated `PUT /api/notifications/devices`.
- Registration is called after Rider login and retried during home initialization.
- Deactivate the device via authenticated DELETE during logout (best effort).
- Configure Android notification channels and handle notification tap at root layout.
- Tap of a `RIDE_REQUEST` navigates to the pending Deliveries screen, not directly to the active-ride-only pickup map.
- Set the Rider EAS project ID in app config.
- Configure preview/production EAS Android builds as APKs.
- Run Android bundle/config validation on this branch.

## Backend assumptions (from codex/push-notification-completion)
- `PUT /api/notifications/devices` takes `app`, `installationId` (16–64 chars), `token`, `platform`.
- `DELETE /api/notifications/devices/{app}/{installationId}`.
- Push payload contains `type` and `rideId`; `RIDE_REQUEST` is the actionable offer.
- Backend branch must be reviewed/deployed with its production migrations and push worker verified before end-to-end testing.

## Important remaining frontend work
The current Deliveries route is a list/history screen, not an actionable pending-offer view. The backend `GET /api/notifications/ride-requests` returns pending requests, but the current mobile screen does not fetch this endpoint or accept a notificationRideId parameter. Implement exact pending-offer hydration and acceptance only after checking the backend contract/acceptance semantics on the deployed version. Don't fabricate an offer or substitute another ride if the notified offer has expired.

## Required tests
1. Confirm login succeeds when push registration endpoint is absent/unavailable (registration failure must not block app login).
2. On physical Android APK, confirm permission and obtain Expo token; token value must not be logged or pasted into chat.
3. Confirm authenticated registration returns `registered: true`.
4. Force-close normally/background and send a test push; verify tap route and exact ride matching.
5. Confirm logout calls device DELETE before token removal.
6. Confirm invalid/expired ride tap does not open an unrelated ride.

## Not yet verified
No Android native APK has been built or installed in this environment. No physical-device push delivery is claimed. EAS FCM V1 credentials and the Render deployment/database migration are owned by the backend/Expo account admin and must be checked there.
