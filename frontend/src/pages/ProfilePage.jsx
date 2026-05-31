import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { cowAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cowCount, setCowCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cowAPI
      .getCount()
      .then(({ data }) => setCowCount(data.count || 0))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('profile')}</h1>

        <div className="card mb-6 text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            👨‍🌾
          </div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-500 mt-1">{user?.phone}</p>
          {loading ? (
            <LoadingSpinner size="sm" className="mx-auto mt-3" />
          ) : (
            <p className="mt-3 text-primary-600 font-medium">
              🐄 {t('totalCows')}: {cowCount}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-2">📞 {t('customerCare')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">1800-123-4567</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">support@smartcattle.pro</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-2">ℹ️ {t('aboutApp')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('aboutText')}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">❓ {t('helpSection')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('helpText')}</p>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
              <li>• {t('helpItems.addCow')}</li>
              <li>• {t('helpItems.disease')}</li>
              <li>• {t('helpItems.vaccination')}</li>
              <li>• {t('helpItems.emergency')}</li>
            </ul>
          </div>

          <button
            onClick={handleLogout}
            className="w-full btn-danger py-3 text-base"
          >
            🚪 {t('logout')}
          </button>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
