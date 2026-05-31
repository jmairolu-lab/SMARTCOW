import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { weatherAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const WeatherPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = (lat, lng) => {
      weatherAPI
        .get(lat, lng)
        .then(({ data }) => {
          if (data.success) setWeather(data.weather);
        })
        .catch(() => addToast(t('error'), 'error'))
        .finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(12.9716, 77.5946)
      );
    } else {
      fetchWeather(12.9716, 77.5946);
    }
  }, []);

  const getAdviceIcon = (type) => {
    switch (type) {
      case 'heat': return '🔥';
      case 'rain': return '🌧️';
      case 'cold': return '❄️';
      default: return '✅';
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('weather')}</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500">{t('loadingWeather')}</p>
          </div>
        ) : weather ? (
          <>
            <div className="card mb-6 bg-gradient-to-br from-sky-400 to-blue-600 text-white">
              <p className="text-sky-100 text-sm">{weather.location}</p>
              <div className="flex items-end gap-4 mt-2">
                <span className="text-6xl font-bold">{weather.temperature}°C</span>
                <span className="text-xl mb-2">{weather.condition}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-sky-100 text-xs">{t('humidity')}</p>
                  <p className="text-xl font-semibold">{weather.humidity}%</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-sky-100 text-xs">{t('condition')}</p>
                  <p className="text-xl font-semibold capitalize">{weather.description || weather.condition}</p>
                </div>
              </div>
            </div>

            <h2 className="font-semibold text-lg mb-4">{t('cattleCareAdvice')}</h2>
            <div className="space-y-3">
              {(weather.advice || []).map((item, idx) => (
                <div key={idx} className="card flex gap-3">
                  <span className="text-2xl">{getAdviceIcon(item.type)}</span>
                  <p className="text-sm leading-relaxed">{item.message}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card text-center py-12 text-gray-500">{t('noData')}</div>
        )}
      </main>
    </>
  );
};

export default WeatherPage;
