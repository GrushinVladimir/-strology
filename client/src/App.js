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
  const initialQuestionsCount = 10; // Начальное количество вопросов  
  const [remainingQuestions, setRemainingQuestions] = useState(initialQuestionsCount);  

  // Функция для загрузки количества оставшихся вопросов  
  const loadRemainingQuestions = () => {  
    const storedData = localStorage.getItem('remainingQuestions');  
    const storedTime = localStorage.getItem('questionsTimestamp');  

    // Если данные существуют, проверяем срок их актуальности  
    if (storedData) {  
      const timestamp = new Date(storedTime);  
      const now = new Date();  
      const daysDifference = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));  

      if (daysDifference < 7) {  
        setRemainingQuestions(parseInt(storedData, 10));  
      } else {  
        // Если прошло больше 7 дней, сбрасываем  
        localStorage.removeItem('remainingQuestions');  
        localStorage.removeItem('questionsTimestamp');  
        setRemainingQuestions(initialQuestionsCount); // Сбросить на 10  
      }  
    }  
  };  

  // Функция для сохранения текущего количества вопросов  
  const saveRemainingQuestions = (count) => {  
    localStorage.setItem('remainingQuestions', count);  
    localStorage.setItem('questionsTimestamp', new Date().toISOString());  
  };  

  useEffect(() => {  
    loadRemainingQuestions();  
  }, []);  

  const decrementQuestions = () => {  
    if (remainingQuestions > 0) {  
      const newCount = remainingQuestions - 1;  
      setRemainingQuestions(newCount);  
      saveRemainingQuestions(newCount); // Сохраняем новое значение  
    }  
  };  

  const handleGetMoreQuestions = () => {  
    setRemainingQuestions(10); // Сброс до 10  
    saveRemainingQuestions(10); // Сохранение нового значения в localStorage  
    alert('Получение новых вопросов...');  
  }; 


  
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
        <Route path="/zadaniya" element={<Zadaniya telegramId={telegramId} remainingQuestions={remainingQuestions} setRemainingQuestions={setRemainingQuestions}/>} />
        <Route path="/chat" element={<ChatPage             remainingQuestions={remainingQuestions}  
            setRemainingQuestions={setRemainingQuestions}/>} />
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
