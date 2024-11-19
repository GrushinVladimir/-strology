import './App.css';
import { useTelegram } from './components/hooks/useTelegram';
import Header from './components/Header/Header';
import Body from './components/Body/Body';
import MainPage from './components/Body/main';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ProfilePage from './components/Body/ProfilePage';
import Test from './components/Body/test';
import Zadaniya from './components/Body/zadaniya';
import ChatPage from './components/Body/ChatPage';

function App() {
  const { tg } = useTelegram();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({});
  const [isUserExist, setIsUserExist] = useState(false);
  const [telegramId, setTelegramId] = useState(null);  // Состояние для хранения telegramId
  const navigate = useNavigate();

  useEffect(() => {
    tg.ready();
  }, [tg]);

  useEffect(() => {
    async function checkUser() {
      try {
        const id = tg?.initDataUnsafe?.user?.id;  // Получаем ID пользователя из Telegram
        setTelegramId(id);  // Сохраняем telegramId в состоянии

        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();

        if (data.exists) {
          setIsUserExist(true);
          if (window.location.pathname === '/') {
            navigate('/main');
          }
        }
      } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
      }
    }

    if (!isUserExist) {
      checkUser();
    }
  }, [tg, navigate, isUserExist]);

  const handleStart = () => {
    setUserName(userName);
    setStep(1);
  };

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  return (
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
        <Route path="/main" element={<MainPage telegramId={telegramId} />} /> {/* Передаём telegramId как пропс */}
        <Route path="/profile" element={<ProfilePage telegramId={telegramId}/>} />
        <Route path="/test" element={<Test />} />
        <Route path="/zadaniya" element={<Zadaniya />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
