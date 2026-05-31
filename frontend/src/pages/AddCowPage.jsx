import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { cowAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const BREEDS = [
  { value: 'Gir', labelKey: 'breeds.gir' },
  { value: 'HF', labelKey: 'breeds.hf' },
  { value: 'Jersey', labelKey: 'breeds.jersey' },
  { value: 'Sahiwal', labelKey: 'breeds.sahiwal' },
  { value: 'Local Indian Breed', labelKey: 'breeds.local' },
];

const AddCowPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    breed: 'Gir',
    vaccinated: 'No',
    healthStatus: 'Healthy',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.age) {
      addToast(t('error'), 'error');
      return;
    }

    setLoading(true);
    try {
      const { data } = await cowAPI.create({
        ...form,
        age: Number(form.age),
      });
      if (data.success) {
        addToast(t('cowAdded'), 'success');
        navigate('/cows');
      }
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('addCow')}</h1>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t('cowName')}</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('age')}</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              min="0"
              max="30"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('breed')}</label>
            <select name="breed" value={form.breed} onChange={handleChange} className="input-field">
              {BREEDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {t(b.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('vaccinated')}</label>
            <select name="vaccinated" value={form.vaccinated} onChange={handleChange} className="input-field">
              <option value="Yes">{t('yes')}</option>
              <option value="No">{t('no')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('healthStatus')}</label>
            <select name="healthStatus" value={form.healthStatus} onChange={handleChange} className="input-field">
              <option value="Healthy">{t('healthy')}</option>
              <option value="Unhealthy">{t('unhealthy')}</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <LoadingSpinner size="sm" /> : null}
            {loading ? t('saving') : t('saveCow')}
          </button>
        </form>
      </main>
    </>
  );
};

export default AddCowPage;
