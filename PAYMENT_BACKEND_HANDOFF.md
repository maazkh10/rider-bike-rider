# Backend handoff: safe Razorpay payment after ride completion

This checklist is based on the updated Rider Booking API reference (especially the `PUT /ride/paymentCompleted` section and the database note on pages 17 and 20). It does not assume that provider checkout endpoints already exist.

## Current documented endpoint

`PUT /ride/paymentCompleted?rideId={rideId}&paymentCompleted=COMPLETED`

The reference says this writes `RIDE_DETAILS.PAYMENT_COMPLETED` and `RIDE_DETAILS.PAYMENT_JSON` and publishes `PAYMENT_COMPLETED`. It also explicitly warns that the endpoint has no role/ownership check, does not validate the payment body/status, and can update any ride. **Do not call it directly from the app as proof of payment.**

## Required backend work

1. Add and apply a migration on the exact Neon/PostgreSQL branch used by Render for `RIDE_DETAILS.PAYMENT_COMPLETED` (text) and `RIDE_DETAILS.PAYMENT_JSON` (jsonb), if these columns do not already exist.
2. Implement an authenticated order-creation endpoint. It must load the invoice/ride from the database, require `rideStatus = COMPLETED`, require the invoice to be `PENDING`, and calculate the amount from the server-side invoice—not a client-supplied amount.
3. Create the Razorpay order server-side using the Razorpay Key ID and Key Secret stored only in Render environment variables. Return only the public Key ID, order ID, currency, and authoritative amount needed by the app.
4. Implement server-side payment verification using Razorpay's documented signature-verification method. Do not trust a success callback from the mobile app by itself.
5. Implement a Razorpay webhook endpoint with webhook-signature verification and idempotent event handling. Ensure duplicate callbacks cannot mark the invoice paid twice.
6. Harden `PUT /ride/paymentCompleted`: enforce ride/invoice ownership and valid completed-ride state, and allow updates only after trusted server-side verification. The mobile app must not be able to mark any ride paid by submitting a body.
7. Persist provider order/payment IDs and verified status. Make payment status queryable by ride/invoice so the app can recover after app close or network loss.
8. Publish `PAYMENT_COMPLETED` only after the verified transaction is committed. Ensure the invoice status also changes from `PENDING` to the agreed paid status.
9. Test duplicate webhook delivery, failed/cancelled checkout, tampered amount, wrong ride ID, invalid signature, and app closure during checkout in Razorpay test mode.

## Frontend integration contract

The Rider app should:
- show only a backend invoice amount for the completed ride;
- request an order from the backend;
- open Razorpay checkout using the returned order ID;
- send the checkout result to the verification endpoint;
- show success only when the server returns a verified paid state; and
- re-fetch payment status if the app resumes after checkout.

The Admin app should display the server-authoritative invoice/payment state, not infer payment from a WebSocket event alone.

## What is still missing from the current PDF

The document does not specify the Razorpay order-create, verify, webhook, or payment-status route names/request/response schemas. The backend owner must provide those exact deployed routes before frontend code can integrate them safely. Do not invent endpoint URLs in the mobile app.
