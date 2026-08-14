# Rider App Patch

## Fixed

1. `getProfile is not a function`
   - The project had both `src/services/profile.ts` (empty) and `src/services/profile.js`.
   - Metro was resolving the empty TypeScript file first.
   - The duplicate `profile.ts` was removed so imports resolve to `profile.js`, which exports `getProfile` and the other profile APIs.

2. Expo Go notification crash
   - Removed the static `expo-notifications` import from startup code.
   - Notifications are loaded dynamically only outside Expo Go (`executionEnvironment !== storeClient`).
   - Expo Go therefore skips push-notification functionality without crashing the app.
   - A development build is still required for Android push notifications.

3. `Too many screens defined. Route "earnings" is extraneous.`
   - The tabs layout referenced `earnings`, but the actual route is `/earning`.
   - The drawer is the navigation entry for Earnings, so the stale `earnings` tab was removed.
   - The bottom tab bar is hidden because this rider app uses the side drawer.

4. Logout
   - Added `logout()` to `src/services/auth.service.js`.
   - It disconnects STOMP, stops live location tracking, clears active ride state, clears the JWT, and removes rider/session cache.
   - No fake backend logout request is made because the supplied API reference does not define a logout endpoint.
   - Both Menu Drawer and Profile screen use the same logout function.

## Required after replacing the project

```bash
npm install
npx expo start -c
```

For Android push notifications, use an Expo development build instead of Expo Go.
