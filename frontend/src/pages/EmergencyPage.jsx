import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';

const EMERGENCY_CONTACTS = [
  { id: 1, labelKey: 'vetEmergency', phone: '1962', icon: '🏥', color: 'from-red-500 to-red-700' },
  { id: 2, labelKey: 'animalAmbulance', phone: '+919876543210', icon: '🚑', color: 'from-orange-500 to-orange-700' },
  { id: 3, labelKey: 'localDoctor', phone: '+911080080080', icon: '👨‍⚕️', color: 'from-blue-500 to-blue-700' },
];

const EmergencyPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2 text-center">{t('emergency')}</h1>
        <p className="text-center text-gray-500 text-sm mb-8">{t('emergencyNote')}</p>

        <div className="space-y-4">
          {EMERGENCY_CONTACTS.map((contact) => (
            <a
              key={contact.id}
              href={`tel:${contact.phone}`}
              className={`block card bg-gradient-to-r ${contact.color} text-white hover:shadow-xl transition-shadow transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex items-center gap-4 py-4">
                <span className="text-4xl">{contact.icon}</span>
                <div>
                  <p className="font-bold text-lg">{t(contact.labelKey)}</p>
                  <p className="text-white/80 text-sm">{t('tapToCall')}: {contact.phone}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </>
  );
};

export default EmergencyPage;
