// Hyderabad neighborhoods with coordinates
export const locations = [
  { name: 'Banjara Hills', lat: 17.4156, lng: 78.4347 },
  { name: 'Jubilee Hills', lat: 17.4325, lng: 78.4073 },
  { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { name: 'Madhapur', lat: 17.4486, lng: 78.3908 },
  { name: 'Kondapur', lat: 17.4589, lng: 78.3631 },
  { name: 'Hitech City', lat: 17.4435, lng: 78.3772 },
  { name: 'Kukatpally', lat: 17.4947, lng: 78.3996 },
  { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 },
  { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
  { name: 'Begumpet', lat: 17.4445, lng: 78.4676 },
  { name: 'Miyapur', lat: 17.4969, lng: 78.3548 },
  { name: 'Manikonda', lat: 17.4052, lng: 78.3863 },
  { name: 'Tolichowki', lat: 17.3953, lng: 78.4141 },
  { name: 'Sainikpuri', lat: 17.4782, lng: 78.5538 },
  { name: 'Dilsukhnagar', lat: 17.3688, lng: 78.5247 },
];

// Haversine distance in km
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Estimate travel time (minutes) assuming avg 25 km/h in city
export function getTravelTime(distanceKm) {
  return Math.round((distanceKm / 25) * 60);
}

export function findLocation(query) {
  const q = query.toLowerCase();
  return locations.find((l) => q.includes(l.name.toLowerCase())) || null;
}
