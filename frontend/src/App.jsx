import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DiseasePage from './pages/DiseasePage';
import AddCowPage from './pages/AddCowPage';
import CowRecordsPage from './pages/CowRecordsPage';
import VaccinationPage from './pages/VaccinationPage';
import VetsPage from './pages/VetsPage';
import WeatherPage from './pages/WeatherPage';
import EmergencyPage from './pages/EmergencyPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/disease" element={<DiseasePage />} />
                  <Route path="/add-cow" element={<AddCowPage />} />
                  <Route path="/cows" element={<CowRecordsPage />} />
                  <Route path="/vaccination" element={<VaccinationPage />} />
                  <Route path="/vets" element={<VetsPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/emergency" element={<EmergencyPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
