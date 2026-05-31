import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { vetAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const VetsPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      setLoading(false);
      addToast(t('locationError'), 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          const { data } = await vetAPI.getNearby(latitude, longitude);
          setVets(data.vets || []);
        } catch {
          addToast(t('error'), 'error');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationError(true);
        setLoading(false);
        addToast(t('locationError'), 'error');
        fetchDefaultVets();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const fetchDefaultVets = async () => {
    try {
      const { data } = await vetAPI.getNearby(12.9716, 77.5946);
      setVets(data.vets || []);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">{t('nearbyVeterinary')}</h1>
        {location && (
          <p className="text-sm text-gray-500 mb-6">
            📍 {t('location')}: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}
        {locationError && (
          <p className="text-sm text-orange-600 mb-4">{t('enableLocation')}</p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500">{t('loadingVets')}</p>
          </div>
        ) : vets.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">{t('noData')}</div>
        ) : (
          <div className="space-y-4">
            {vets.map((vet) => (
              <div key={vet.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">🏥 {vet.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('distance')}: {vet.distance} {t('km')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${vet.phone}`}
                      className="btn-primary text-sm text-center"
                    >
                      📞 {t('call')}
                    </a>
                    <a
                      href={vet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm text-center"
                    >
                      🗺️ {t('directions')}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default VetsPage;
