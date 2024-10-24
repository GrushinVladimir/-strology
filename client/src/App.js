import './App.css';
import { useTelegram } from './components/hooks/useTelegram';
import Body from './components/Body/Body';
import MainPage from './components/Body/main';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './components/Body/ProfilePage';
import Test from './components/Body/test';
import Zadaniya from './components/Body/zadaniya';
import CheckUser from './components/CheckUser';
import ChatPage from './components/Body/ChatPage'; // Страница чата

import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom'; // Импортируем Link

function App() {
  const { tg } = useTelegram();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    tg.ready();
  }, [tg]);

  const handleStart = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/checkUser?telegramId=${tg.initDataUnsafe.user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setIsUserRegistered(true);
        } else {
          window.location.href = "/body";
        }
      } else {
        console.error('Ошибка при проверке пользователя');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  const handleUserRegistration = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: tg.initDataUnsafe.user.id,
          ...userData,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Пользователь сохранён:', userData);
        setIsUserRegistered(true);
      } else {
        console.error('Ошибка при сохранении пользователя');
      }
    } catch (error) {
      console.error('Ошибка сети при сохранении пользователя:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CheckUser onStart={handleStart} />} />
          <Route path="/body" element={<Body handleStart={handleUserRegistration} />} />
          <Route path="/main" element={isUserRegistered ? <MainPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={isUserRegistered ? <ProfilePage /> : <Navigate to="/" />} />
          <Route path="/chat" element={isUserRegistered ? <ChatPage /> : <Navigate to="/" />} />
          <Route path="/test" element={isUserRegistered ? <Navigate to="/main" /> : <Test />} />
          <Route path="/zadaniya" element={<Zadaniya />} />
        </Routes>

        {/* Bottom Navigation */}
        <BottomNavigation value={value} onChange={(event, newValue) => setValue(newValue)} showLabels>
          <BottomNavigationAction
            label="Главная"
            icon={<HomeIcon />}
            component={Link}
            to="/main"
          />
          <BottomNavigationAction
            label="Чат"
            icon={<ChatIcon />}
            component={Link}
            to="/chat"
          />
          <BottomNavigationAction
            label="Профиль"
            icon={<PersonIcon />}
            component={Link}
            to="/profile"
          />
        </BottomNavigation>
      </div>
    </Router>
  );
}

export default App;
