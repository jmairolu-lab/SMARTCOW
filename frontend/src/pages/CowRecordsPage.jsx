import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { cowAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const BREEDS = ['Gir', 'HF', 'Jersey', 'Sahiwal', 'Local Indian Breed'];

const CowRecordsPage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card');
  const [breedFilter, setBreedFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [editingCow, setEditingCow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchCows = async () => {
    setLoading(true);
    try {
      const params = {};
      if (breedFilter) params.breed = breedFilter;
      if (healthFilter) params.healthStatus = healthFilter;
      const { data } = await cowAPI.getAll(params);
      setCows(data.cows || []);
    } catch {
      addToast(t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCows();
  }, [breedFilter, healthFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await cowAPI.delete(id);
      addToast(t('cowDeleted'), 'success');
      fetchCows();
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    }
  };

  const startEdit = (cow) => {
    setEditingCow(cow._id);
    setEditForm({
      name: cow.name,
      age: cow.age,
      breed: cow.breed,
      vaccinated: cow.vaccinated,
      healthStatus: cow.healthStatus,
    });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { data } = await cowAPI.update(editingCow, { ...editForm, age: Number(editForm.age) });
      if (data.success) {
        addToast(t('cowUpdated'), 'success');
        setEditingCow(null);
        fetchCows();
      }
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">{t('cowRecords')}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'card' ? 'bg-primary-600 text-white' : 'btn-secondary'}`}
            >
              {t('cardView')}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'btn-secondary'}`}
            >
              {t('tableView')}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            className="input-field sm:max-w-xs"
          >
            <option value="">{t('allBreeds')}</option>
            {BREEDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="input-field sm:max-w-xs"
          >
            <option value="">{t('allHealth')}</option>
            <option value="Healthy">{t('healthy')}</option>
            <option value="Unhealthy">{t('unhealthy')}</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : cows.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">{t('noCows')}</div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cows.map((cow) => (
              <div key={cow._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">🐄 {cow.name}</h3>
                    <p className="text-sm text-gray-500">{cow.breed}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    cow.healthStatus === 'Healthy'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {cow.healthStatus === 'Healthy' ? t('healthy') : t('unhealthy')}
                  </span>
                </div>
                <div className="text-sm space-y-1 mb-4">
                  <p>{t('age')}: {cow.age}</p>
                  <p>{t('vaccinated')}: {cow.vaccinated === 'Yes' ? t('yes') : t('no')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(cow)} className="btn-secondary flex-1 text-sm">{t('edit')}</button>
                  <button onClick={() => handleDelete(cow._id)} className="btn-danger flex-1 text-sm">{t('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-2">{t('cowName')}</th>
                  <th className="text-left py-3 px-2">{t('age')}</th>
                  <th className="text-left py-3 px-2">{t('breed')}</th>
                  <th className="text-left py-3 px-2">{t('vaccinated')}</th>
                  <th className="text-left py-3 px-2">{t('healthStatus')}</th>
                  <th className="text-left py-3 px-2">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {cows.map((cow) => (
                  <tr key={cow._id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-2 font-medium">{cow.name}</td>
                    <td className="py-3 px-2">{cow.age}</td>
                    <td className="py-3 px-2">{cow.breed}</td>
                    <td className="py-3 px-2">{cow.vaccinated === 'Yes' ? t('yes') : t('no')}</td>
                    <td className="py-3 px-2">{cow.healthStatus === 'Healthy' ? t('healthy') : t('unhealthy')}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(cow)} className="text-primary-600 hover:underline">{t('edit')}</button>
                        <button onClick={() => handleDelete(cow._id)} className="text-red-600 hover:underline">{t('delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingCow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md space-y-4">
              <h2 className="text-lg font-semibold">{t('updateCow')}</h2>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field"
                placeholder={t('cowName')}
              />
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                className="input-field"
                placeholder={t('age')}
              />
              <select
                value={editForm.breed}
                onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                className="input-field"
              >
                {BREEDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <select
                value={editForm.vaccinated}
                onChange={(e) => setEditForm({ ...editForm, vaccinated: e.target.value })}
                className="input-field"
              >
                <option value="Yes">{t('yes')}</option>
                <option value="No">{t('no')}</option>
              </select>
              <select
                value={editForm.healthStatus}
                onChange={(e) => setEditForm({ ...editForm, healthStatus: e.target.value })}
                className="input-field"
              >
                <option value="Healthy">{t('healthy')}</option>
                <option value="Unhealthy">{t('unhealthy')}</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setEditingCow(null)} className="btn-secondary flex-1">{t('cancel')}</button>
                <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <LoadingSpinner size="sm" /> : t('save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CowRecordsPage;
