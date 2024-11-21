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
  const [telegramId, setTelegramId] = useState(null);  
  const navigate = useNavigate();  
  const initialQuestionsCount = 10;  
  const [remainingQuestions, setRemainingQuestions] = useState(initialQuestionsCount);  

  const loadRemainingQuestions = () => {  
    const storedData = localStorage.getItem('remainingQuestions');  
    const storedTime = localStorage.getItem('questionsTimestamp');  
    const userQuestions = storedData ? JSON.parse(storedData) : {};  
    const currentQuestionsCount = userQuestions[telegramId] || initialQuestionsCount;  
  
    if (storedTime) {  
      const timestamp = new Date(storedTime);  
      const now = new Date();  
      const daysDifference = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));  
  
      if (daysDifference < 7) {  
        setRemainingQuestions(currentQuestionsCount);  
      } else {  
        delete userQuestions[telegramId];  
        localStorage.setItem('remainingQuestions', JSON.stringify(userQuestions));  
        setRemainingQuestions(initialQuestionsCount);  
        console.log('Счетчик сброшен для telegramId:', telegramId);  
      }  
    } else {  
      setRemainingQuestions(currentQuestionsCount);  
    }  
  };  

  useEffect(() => {  
    if (telegramId) {  
      console.log('Загружаем оставшиеся вопросы для telegramId:', telegramId);  
      loadRemainingQuestions();  
    }  
  }, [telegramId]);   
  
  const saveRemainingQuestions = (count) => {  
    const storedData = localStorage.getItem('remainingQuestions');  
    const userQuestions = storedData ? JSON.parse(storedData) : {};  
    userQuestions[telegramId] = count;  
    localStorage.setItem('remainingQuestions', JSON.stringify(userQuestions));  
    localStorage.setItem('questionsTimestamp', new Date().toISOString());  
    console.log('Сохраненные данные:', userQuestions);  
  };  
  
  const decrementQuestions = () => {  
    if (remainingQuestions > 0) {  
      const newCount = remainingQuestions - 1;  
      setRemainingQuestions(newCount);  
      saveRemainingQuestions(newCount);  
    }  
  };  

  const handleGetMoreQuestions = () => {  
    setRemainingQuestions(initialQuestionsCount);  
    saveRemainingQuestions(initialQuestionsCount);  
    alert('Получение новых вопросов...');  
  };  

  useEffect(() => {  
    async function checkUser() {  
      try {  
        const id = tg?.initDataUnsafe?.user?.id;  
        setTelegramId(id);  
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
    }    if (!isUserExist) {  
      checkUser();  
    }  
  }, [isUserExist, tg]);  

  // Функция для обработки начала  
  const handleStart = (name) => {  
    setUserName(name);  
    setStep(1);  
  };  

  // Функция для обработки перехода на следующий шаг  
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
        <Route path="/main" element={<MainPage telegramId={telegramId} />} />  
        <Route path="/profile" element={<ProfilePage telegramId={telegramId} />} />  
        <Route path="/test" element={<Test />} />  
        <Route path="/zadaniya" element={  
          <Zadaniya telegramId={telegramId} remainingQuestions={remainingQuestions} handleGetMoreQuestions={handleGetMoreQuestions} />  
        } />  
        <Route path="/chat" element={  
          <ChatPage remainingQuestions={remainingQuestions} decrementQuestions={decrementQuestions} />  
        } />  
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