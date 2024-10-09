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

  const handleStart = async () => {
    setUserName(userName);
    setStep(1);

    // Отправка данных пользователя на сервер
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId: tg.initDataUnsafe.user.id, // ID пользователя Telegram
        name: userName,
      }),
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('Пользователь сохранён:', userData);
    } else {
      console.error('Ошибка при сохранении пользователя');
    }
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
          <Route path="/test" element={<Test />} /> {/* Добавляем маршрут для Test */}
          <Route path="/zadaniya" element={<Zadaniya />} /> {/* Добавляем маршрут для Zadaniya */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
