// backend/services/geofenceEngine.js
// Hyperlocal Jalpaiguri Geodesic Haversine Engine & Municipal Geofencing

/**
 * Calculates exact geodesic Haversine distance between two coordinates in kilometers.
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;

  // Road curvature factor in Jalpaiguri town (approx 1.28x)
  const roadDistanceKm = Math.round(straightLineDistance * 1.28 * 10) / 10;
  return Math.max(0.5, roadDistanceKm);
}

/**
 * Validates if the customer is within the shop's legal delivery perimeter (default 6.0 km).
 */
function validateDeliveryGeofence(shopLat, shopLng, customerLat, customerLng, maxRadiusKm = 6.0) {
  const distanceKm = calculateHaversineDistance(shopLat, shopLng, customerLat, customerLng);
  const isDeliverable = distanceKm <= maxRadiusKm;

  // Average rider speed: 22 km/h + 8 mins packaging
  const travelMinutes = Math.round((distanceKm / 22) * 60);
  const etaMinutes = 8 + travelMinutes;

  return {
    isDeliverable,
    distanceKm,
    maxRadiusKm,
    etaMinutes,
    message: isDeliverable
      ? `Deliverable within Jalpaiguri Municipal Area (${distanceKm} km • Est. ${etaMinutes} mins)`
      : `Address is ${distanceKm} km away, exceeding maximum legal radius of ${maxRadiusKm} km for this shop.`,
  };
}

module.exports = {
  calculateHaversineDistance,
  validateDeliveryGeofence,
};
