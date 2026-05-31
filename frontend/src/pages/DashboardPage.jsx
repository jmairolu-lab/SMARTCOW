import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { cowAPI, vaccinationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, healthy: 0, alerts: 0 });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cowsRes, vaccRes] = await Promise.all([
          cowAPI.getAll(),
          vaccinationAPI.getAll(),
        ]);

        const cows = cowsRes.data.cows || [];
        const healthy = cows.filter((c) => c.healthStatus === 'Healthy').length;
        const alertList = vaccRes.data.alerts || [];

        setStats({
          total: cows.length,
          healthy,
          alerts: alertList.length,
        });
        setAlerts(alertList.slice(0, 3));
      } catch {
        /* handled by interceptor */
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    { path: '/disease', label: t('diseaseDetection'), icon: '🔬', color: 'bg-blue-500' },
    { path: '/add-cow', label: t('addCow'), icon: '➕', color: 'bg-green-500' },
    { path: '/cows', label: t('cowRecords'), icon: '📋', color: 'bg-purple-500' },
    { path: '/vaccination', label: t('vaccination'), icon: '💉', color: 'bg-orange-500' },
    { path: '/vets', label: t('nearbyVets'), icon: '🏥', color: 'bg-teal-500' },
    { path: '/emergency', label: t('emergency'), icon: '🚨', color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            {t('welcome')}, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('appSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-green-100 text-sm">{t('totalCows')}</p>
            <p className="text-4xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-blue-100 text-sm">{t('healthyCows')}</p>
            <p className="text-4xl font-bold mt-1">{stats.healthy}</p>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <p className="text-orange-100 text-sm">{t('vaccinationAlerts')}</p>
            <p className="text-4xl font-bold mt-1">{stats.alerts}</p>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="card mb-8 border-l-4 border-orange-500">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">{t('upcomingAlerts')}</h2>
              <Link to="/vaccination" className="text-primary-600 text-sm hover:underline">
                {t('viewAll')}
              </Link>
            </div>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm"
                >
                  <span>⚠️</span>
                  <span>
                    {t('vaccineAlert', { name: alert.cowName, vaccine: alert.vaccineName })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="card hover:shadow-lg transition-shadow text-center group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <p className="text-sm font-medium">{action.label}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
