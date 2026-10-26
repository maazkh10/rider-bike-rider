# Payment integration status — updated from backend API reference

## What the existing backend has

The updated `RIDER_BOOKING_API_AND_DATABASE_REFERENCE_UPDATED 5.pdf` documents an existing endpoint:

`PUT /ride/paymentCompleted?rideId={rideId}&paymentCompleted=COMPLETED`

It requires a JWT and accepts a JSON body such as `provider`, `paymentId`, and `amount`. It stores the body in `RIDE_DETAILS.PAYMENT_JSON`, updates `RIDE_DETAILS.PAYMENT_COMPLETED`, and publishes a `PAYMENT_COMPLETED` WebSocket event.

## Why the app must not call it as proof of payment yet

The same reference explicitly warns that the endpoint currently:
- has no endpoint role or ride-ownership check;
- does not validate the provider payment status or request body;
- can update any existing ride; and
- needs database columns `RIDE_DETAILS.PAYMENT_COMPLETED` (text) and `RIDE_DETAILS.PAYMENT_JSON` (jsonb), for which the reference says no migration file currently exists.

The reference does **not** document a Razorpay order-creation endpoint, server-side payment-signature verification endpoint, or Razorpay webhook endpoint. A client-only checkout or a direct call to `/ride/paymentCompleted` would be spoofable and must not be represented as a real verified payment.

## Safe frontend behavior currently in this branch

- No random/default fare is used when a valid fare is missing.
- The processing screen does not simulate a payment or navigate to success.
- The success screen does not show success without a server-verified result.
- The UI must not claim that Razorpay checkout is active until a real server-side order and verification flow exists.
- Never put the Razorpay Key Secret in the app or log JWTs/push tokens.

## Backend handoff required before live checkout

See [PAYMENT_BACKEND_HANDOFF.md](./PAYMENT_BACKEND_HANDOFF.md). The backend owner must implement and deploy the secure provider flow before the frontend can truthfully complete payments. The current API documentation alone is not enough to safely finish live Razorpay checkout.
