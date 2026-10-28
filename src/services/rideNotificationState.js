export const selectPendingOffer = (offers, requestedRideId, dismissed = new Set()) => {
  const eligible = offers.filter(offer => !dismissed.has(String(offer.rideId)));
  return requestedRideId
    ? eligible.find(offer => String(offer.rideId) === String(requestedRideId))
    : eligible[0];
};
