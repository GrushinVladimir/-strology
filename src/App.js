import './App.css';
import { useTelegram } from './components/hooks/useTelegram';
import Header from './components/Header/Header';
import Body from './components/Body/Body';
import MainPage from './components/Body/main'; // Подключаем MainPage
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Импортируем BrowserRouter и другие компоненты
import ProfilePage from './components/Body/ProfilePage'; // Импорт ProfilePage
import Test from './components/Body/test'; 
import Zadaniya from './components/Body/zadaniya'; 
function App() {
  const { onToggleButton, tg } = useTelegram();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    tg.ready();
  }, []);

  const handleStart = () => {
    setUserName(userName);
    setStep(1);
  };

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <Body
                step={step}
                userName={userName}
                handleStart={handleStart}
                handleNext={handleNext}
                formData={formData}
              />
            }
          />
          <Route path="/main" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* Добавляем маршрут для ProfilePage */}
          <Route path="/test" element={<Test />} /> {/* Добавляем маршрут для ProfilePage */}
          <Route path="/zadaniya" element={<Zadaniya />} /> {/* Добавляем маршрут для ProfilePage */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
