import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { diseaseAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

const SYMPTOM_KEYS = [
  { key: 'symptoms.fever', value: 'Fever' },
  { key: 'symptoms.lossOfAppetite', value: 'Loss of appetite' },
  { key: 'symptoms.limping', value: 'Limping' },
  { key: 'symptoms.swelling', value: 'Swelling' },
  { key: 'symptoms.mouthUlcers', value: 'Mouth ulcers' },
];

const DiseasePage = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [tab, setTab] = useState('image');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [symptomResult, setSymptomResult] = useState(null);
  const [symptomLoading, setSymptomLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageResult(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) {
      addToast(t('noImageSelected'), 'error');
      return;
    }

    setImageLoading(true);
    setImageResult(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const { data } = await diseaseAPI.analyzeImage(formData);
      if (data.success) {
        setImageResult(data);
        addToast(t('success'), 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('error');
      addToast(msg === 'Only cow-related images allowed' ? t('onlyCowImages') : msg, 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const toggleSymptom = (value) => {
    setSelectedSymptoms((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms((prev) => [...prev, trimmed]);
      setCustomSymptom('');
    }
  };

  const handlePredictSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      addToast(t('selectSymptoms'), 'error');
      return;
    }

    setSymptomLoading(true);
    setSymptomResult(null);
    try {
      const { data } = await diseaseAPI.analyzeSymptoms({ symptoms: selectedSymptoms });
      if (data.success) {
        setSymptomResult(data);
        addToast(t('success'), 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || t('error'), 'error');
    } finally {
      setSymptomLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('diseaseDetection')}</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('image')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              tab === 'image'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            📷 {t('imageDetection')}
          </button>
          <button
            onClick={() => setTab('symptom')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              tab === 'symptom'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            🩺 {t('symptomDetection')}
          </button>
        </div>

        {tab === 'image' && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">{t('imageDetection')}</h2>
            <div>
              <label className="block text-sm font-medium mb-2">{t('uploadImage')}</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 rounded-lg object-contain mx-auto border border-gray-200 dark:border-gray-600"
              />
            )}
            <button
              onClick={handleAnalyzeImage}
              disabled={imageLoading || !imageFile}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {imageLoading ? <LoadingSpinner size="sm" /> : null}
              {imageLoading ? t('analyzing') : t('analyze')}
            </button>

            {imageResult && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-2">
                <p><strong>{t('disease')}:</strong> {imageResult.disease}</p>
                <p><strong>{t('confidence')}:</strong> {imageResult.confidence}%</p>
                <p><strong>{t('treatment')}:</strong> {imageResult.treatment}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'symptom' && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">{t('symptomDetection')}</h2>
            <div>
              <label className="block text-sm font-medium mb-2">{t('selectSymptoms')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SYMPTOM_KEYS.map((s) => (
                  <label
                    key={s.value}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSymptoms.includes(s.value)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(s.value)}
                      onChange={() => toggleSymptom(s.value)}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm">{t(s.key)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('customSymptom')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder={t('customSymptomPlaceholder')}
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomSymptom()}
                />
                <button onClick={addCustomSymptom} className="btn-secondary whitespace-nowrap">
                  {t('addSymptom')}
                </button>
              </div>
            </div>

            {selectedSymptoms.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">{t('selectedSymptoms')}:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                    >
                      {s}
                      <button
                        onClick={() => toggleSymptom(s)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handlePredictSymptoms}
              disabled={symptomLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {symptomLoading ? <LoadingSpinner size="sm" /> : null}
              {symptomLoading ? t('predicting') : t('predict')}
            </button>

            {symptomResult && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                <p><strong>{t('disease')}:</strong> {symptomResult.disease}</p>
                <p><strong>{t('severity')}:</strong> {symptomResult.severity}</p>
                <p><strong>{t('suggestion')}:</strong> {symptomResult.suggestion}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default DiseasePage;
