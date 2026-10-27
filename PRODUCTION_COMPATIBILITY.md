# Backend production compatibility

Branch `ariyaan-changes` is based on the latest `feature/ride-end-otp-back-buttons` commit `e8900c5`.
Pair this app with backend `ariyaanshaikh/Rider-Booking-App:production-changes`.

The email confirmation contract is POST /register/confirmToken with {email, otp}; resend is POST /register/verifyEmail with {emailAddress}. Login requires the real password API and never falls back to /sendJWT. Account tokens are saved with the existing SecureStore helper. OTPs remain readable in the backend database.

OTP verification uses the active ride returned by the server, including AWAITING_PAYMENT. The trip screen polls for server-confirmed STARTED status before enabling End Ride. Rider location and existing notification topics retain their contracts. Payout display uses the server's riderPaise allocation. The unused canary @expo/ui package was removed; it was not imported by app source.

Expo stays on SDK 54. Explicit Babel transforms support Hermes private fields. .npmrc uses legacy peer resolution and an Expo override prevents a second, incompatible SDK from entering the graph. Compatible security updates are in package-lock.json; remaining audit findings require review before release. No forced major SDK upgrade is included.

Run `npm ci --ignore-scripts`, `node --test scripts/api-contract.test.cjs`, and `CI=1 npx expo export --platform android --output-dir dist-production`. CI runs the same checks.

Bundle exports and service contract tests do not replace physical-device checks: signup/resend/login, dispatch, accept/cancel/rematch, OTP, Razorpay test checkout, reconnect/location, completion and invoices. Real payments, production deployment and backend secrets are outside this branch. Existing remote-push documentation still applies; durable background delivery requires backend push-token registration and a delivery worker.
