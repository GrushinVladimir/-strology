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
import FAQPage from './components/Body/FAQPage'; 


function App() {  
  const { tg } = useTelegram();  
  const navigate = useNavigate();  
  const [step, setStep] = useState(0);  
  const [userName, setUserName] = useState('');  
  const [formData, setFormData] = useState({});  
  const initialQuestionsCount = 10;  
  const [remainingQuestions, setRemainingQuestions] = useState(initialQuestionsCount);  
  const [telegramId, setTelegramId] = useState(null);  

  useEffect(() => {  
    tg.ready(); // Подготовка Telegram  
    const id = tg?.initDataUnsafe?.user?.id; // Получаем telegramId  
    if (id) {  
      checkUser(id); // Сразу проверяем пользователя  
    }  
  }, [tg]);  

  const checkUser = async (id) => {  
    try {  
      const response = await fetch(`/api/users/${id}`); // Проверка существования пользователя  
      const data = await response.json();  

      if (data.exists) {  
        setTelegramId(id); // Сохраняем telegramId в состоянии  
        navigate('/main'); // Переход на главную страницу  
      } else {  
        console.warn('Пользователь не найден');  
      }  
    } catch (error) {  
      console.error('Ошибка при проверке пользователя:', error);  
    }  
  };  

  // Функция для загрузки оставшихся вопросов из БД  
  const loadRemainingQuestions = async () => {  
    if (!telegramId) return; // Проверяем, существует ли telegramId  

    try {  
      const response = await fetch(`/api/questions/${telegramId}`);  
      const data = await response.json();  
      setRemainingQuestions(data.remainingQuestions ?? initialQuestionsCount); // Загружаем оставшиеся вопросы  
    } catch (error) {  
      console.error('Ошибка при загрузке оставшихся вопросов:', error);  
      setRemainingQuestions(initialQuestionsCount); // Устанавливаем значение по умолчанию при ошибке  
    }  
  };  

  useEffect(() => {  
    loadRemainingQuestions(); // Загружаем оставшиеся вопросы, как только telegramId будет установлен  
  }, [telegramId]);  

  const decrementQuestions = () => {  
    if (remainingQuestions > 0) {  
      const newCount = remainingQuestions - 1;  
      setRemainingQuestions(newCount);  
      saveRemainingQuestions(newCount); // Сохраняем новое количество вопросов в БД  
    }  
  };  

  const saveRemainingQuestions = async (count) => {  
    try {  
      await fetch(`/api/questions/${telegramId}`, {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({ remainingQuestions: count }),  
      });  
    } catch (error) {  
      console.error('Ошибка при сохранении оставшихся вопросов:', error);  
    }  
  };  

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
        <Route path="/main" element={<MainPage telegramId={telegramId} />} />  
        <Route path="/profile" element={<ProfilePage telegramId={telegramId} />} />  
        <Route path="/test" element={<Test />} />  
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/zadaniya" element={<Zadaniya telegramId={telegramId} remainingQuestions={remainingQuestions} handleGetMoreQuestions={handleGetMoreQuestions} />} />  
        <Route path="/chat" element={<ChatPage remainingQuestions={remainingQuestions} decrementQuestions={decrementQuestions} />} />  
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