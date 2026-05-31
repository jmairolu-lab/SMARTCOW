import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const { t } = useLanguage();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validatePhone = () => /^[6-9]\d{9}$/.test(phone);

  const handleSendOtp = async () => {
    if (mode === 'register' && !name.trim()) {
      addToast(t('nameRequired'), 'error');
      return;
    }
    if (!validatePhone()) {
      addToast(t('invalidPhone'), 'error');
      return;
    }

    setLoading(true);
    try {
      const apiCall = mode === 'register'
        ? authAPI.register({ name: name.trim(), phone })
        : authAPI.login({ phone });

      const { data } = await apiCall;

      if (data.success) {
        setOtpSent(true);
        addToast(`${t('otpSent')} ${t('otpDisplayed')} ${data.otp}`, 'otp', 10000);
        addToast(t('otpExpires'), 'info', 6000);
      }
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { data } = await authAPI.resendOtp({ name: name.trim(), phone });
      if (data.success) {
        addToast(`${t('otpSent')} ${t('otpDisplayed')} ${data.otp}`, 'otp', 10000);
        addToast(t('otpExpires'), 'info', 6000);
      }
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      addToast(t('enterOtp'), 'error');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.verifyOtp({
        phone,
        otp,
        name: name.trim(),
      });

      if (data.success) {
        login(data.token, data.user);
        addToast(mode === 'register' ? t('registerSuccess') : t('loginSuccess'), 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-green-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐄</div>
          <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-300">{t('appName')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('appSubtitle')}</p>
        </div>

        <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => { setMode('register'); setOtpSent(false); setOtp(''); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t('register')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setOtpSent(false); setOtp(''); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t('login')}
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('farmerName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="input-field"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('phoneNumber')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder={t('phonePlaceholder')}
              className="input-field"
              disabled={loading}
            />
          </div>

          {otpSent && (
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('enterOtp')}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('otpPlaceholder')}
                className="input-field text-center text-xl tracking-widest"
                disabled={loading}
                maxLength={6}
              />
            </div>
          )}

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {t('sendOtp')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" /> : null}
                {t('verifyOtp')}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="btn-secondary w-full"
              >
                {t('resendOtp')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
