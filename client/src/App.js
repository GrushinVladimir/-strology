import './App.css';
import { useTelegram } from './components/hooks/useTelegram';
import Body from './components/Body/Body';
import MainPage from './components/Body/main'; // Подключаем MainPage
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Импортируем Navigate
import ProfilePage from './components/Body/ProfilePage'; // Импорт ProfilePage
import Test from './components/Body/test'; 
import Zadaniya from './components/Body/zadaniya'; 

function App() {
  const { tg } = useTelegram();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({});
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  useEffect(() => {
    tg.ready();

    // Функция для проверки пользователя
    const checkUser = async () => {
      const response = await fetch(`http://localhost:5000/api/checkUser?telegramId=${tg.initDataUnsafe.user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setIsUserRegistered(true); // Пользователь зарегистрирован
        }
      }
    };

    checkUser(); // Проверка при загрузке
  }, [tg]);

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
      setIsUserRegistered(true); // Установите состояние как зарегистрированное
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
              isUserRegistered ? <Navigate to="/main" /> : (
                <Body
                  step={step}
                  userName={userName}
                  handleStart={handleStart}
                  handleNext={handleNext}
                  formData={formData}
                />
              )
            }
          />
          <Route path="/main" element={isUserRegistered ? <MainPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={isUserRegistered ? <ProfilePage /> : <Navigate to="/" />} />
          <Route path="/test" element={isUserRegistered ? <Navigate to="/main" /> : <Test />} />
          <Route path="/zadaniya" element={<Zadaniya />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
