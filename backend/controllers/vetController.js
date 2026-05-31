const VET_CLINICS = [
  { id: 1, name: 'Karnataka Veterinary Hospital', phone: '+919876543210', lat: 12.9716, lng: 77.5946 },
  { id: 2, name: 'Rural Animal Care Centre', phone: '+919876543211', lat: 12.9750, lng: 77.5900 },
  { id: 3, name: 'Dairy Health Clinic', phone: '+919876543212', lat: 12.9680, lng: 77.5980 },
  { id: 4, name: 'Green Pastures Vet Services', phone: '+919876543213', lat: 12.9650, lng: 77.5850 },
  { id: 5, name: 'Farmers Vet Aid Centre', phone: '+919876543214', lat: 12.9800, lng: 77.6000 },
  { id: 6, name: 'Livestock Emergency Clinic', phone: '+919876543215', lat: 12.9620, lng: 77.5920 },
  { id: 7, name: 'Cattle Care Veterinary Unit', phone: '+919876543216', lat: 12.9740, lng: 77.6050 },
  { id: 8, name: 'Agri Vet Solutions', phone: '+919876543217', lat: 12.9590, lng: 77.5880 },
];

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.getNearbyVets = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude required' });
    }

    const vets = VET_CLINICS.map((vet) => {
      const distance = haversineDistance(lat, lng, vet.lat, vet.lng);
      return {
        id: vet.id,
        name: vet.name,
        phone: vet.phone,
        distance: Math.round(distance * 10) / 10,
        distanceUnit: 'km',
        lat: vet.lat,
        lng: vet.lng,
        mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${vet.lat},${vet.lng}`,
      };
    })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    res.status(200).json({ success: true, count: vets.length, vets });
  } catch (error) {
    next(error);
  }
};
