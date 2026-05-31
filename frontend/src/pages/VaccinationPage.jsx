import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { vaccinationAPI, cowAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const VACCINES = ['FMD', 'Brucellosis', 'Anthrax', 'Blackleg', 'HS', 'BQ'];

const VaccinationPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ cowId: '', vaccineName: 'FMD', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vaccRes, cowRes] = await Promise.all([
        vaccinationAPI.getAll(),
        cowAPI.getAll(),
      ]);
      setRecords(vaccRes.data.vaccinations || []);
      setAlerts(vaccRes.data.alerts || []);
      setCows(cowRes.data.cows || []);
    } catch {
      addToast(t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cowId) {
      addToast(t('selectCow'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await vaccinationAPI.create(form);
      if (data.success) {
        addToast(t('recordAdded'), 'success');
        setShowForm(false);
        setForm({ cowId: '', vaccineName: 'FMD', notes: '' });
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('vaccination')}</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            + {t('addVaccination')}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('selectCow')}</label>
              <select
                value={form.cowId}
                onChange={(e) => setForm({ ...form, cowId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">{t('selectCow')}</option>
                {cows.map((cow) => (
                  <option key={cow._id} value={cow._id}>{cow.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('vaccineName')}</label>
              <select
                value={form.vaccineName}
                onChange={(e) => setForm({ ...form, vaccineName: e.target.value })}
                className="input-field"
              >
                {VACCINES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('notes')}</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('cancel')}</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {submitting ? <LoadingSpinner size="sm" /> : t('save')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-semibold text-lg mb-4">{t('upcomingAlerts')}</h2>
              {alerts.length === 0 ? (
                <div className="card text-center text-gray-500 py-6">{t('noAlerts')}</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`card border-l-4 ${alert.isOverdue ? 'border-red-500' : 'border-orange-500'}`}
                    >
                      <p className="font-medium">
                        {t('vaccineAlert', { name: alert.cowName, vaccine: alert.vaccineName })}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('dueDate')}: {formatDate(alert.dueDate)}
                        {alert.isOverdue && (
                          <span className="ml-2 text-red-600 font-medium">({t('overdue')})</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-4">{t('vaccinationRecords')}</h2>
              {records.length === 0 ? (
                <div className="card text-center text-gray-500 py-6">{t('noData')}</div>
              ) : (
                <div className="space-y-3">
                  {records.map((rec) => (
                    <div key={rec._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">🐄 {rec.cowName}</p>
                        <p className="text-sm text-gray-500">
                          {rec.vaccineName} — {t('dueDate')}: {formatDate(rec.nextDueDate)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {t('lastVaccinated')}: {formatDate(rec.lastVaccinated)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default VaccinationPage;
