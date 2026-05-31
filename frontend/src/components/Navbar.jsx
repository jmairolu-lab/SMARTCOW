import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: '🏠' },
    { path: '/disease', label: t('diseaseDetection'), icon: '🔬' },
    { path: '/add-cow', label: t('addCow'), icon: '➕' },
    { path: '/cows', label: t('cowRecords'), icon: '📋' },
    { path: '/vaccination', label: t('vaccination'), icon: '💉' },
    { path: '/vets', label: t('nearbyVets'), icon: '🏥' },
    { path: '/weather', label: t('weather'), icon: '🌤️' },
    { path: '/emergency', label: t('emergency'), icon: '🚨' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🐄</span>
            <span className="font-bold text-primary-700 dark:text-primary-400 hidden sm:block">
              {t('appName')}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              aria-label={t('language')}
            >
              <option value="en">{t('english')}</option>
              <option value="kn">{t('kannada')}</option>
            </select>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? t('lightMode') : t('darkMode')}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <Link
              to="/profile"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('profile')}
            >
              👤
            </Link>

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="col-span-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
              >
                🚪 {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
