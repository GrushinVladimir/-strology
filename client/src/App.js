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
import LoadingSpinner from './LoadingSpinner';
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
  const [loading, setLoading] = useState(true); // Состояние загрузки  

  useEffect(() => {  
    tg.ready(); // Подготовка Telegram  

    const checkUser = async () => {  
      try {  
        const id = tg?.initDataUnsafe?.user?.id; // Получаем telegramId  
        if (id) {  
          setTelegramId(id); // Сохраняем telegramId  
          const response = await fetch(`/api/users/${id}`); // Проверка существования пользователя  
          const data = await response.json();  

          if (data.exists) {  
            navigate('/main'); // Переход на главную страницу  
          } else {  
            console.warn('Пользователь не найден'); // Если пользователь не найден  
          }  
        }  
      } catch (error) {  
        console.error('Ошибка при проверке пользователя:', error);  
      } finally {  
        setLoading(false); // Устанавливаем состояние загрузки в false, когда проверка завершена  
      }  
    };  

    checkUser(); // Запускаем проверку пользователя  
  }, [tg, navigate]);  

  if (loading) {  
    return <LoadingSpinner />; // Компонент индикатора загрузки  
  }  

  // Функция для загрузки оставшихся вопросов из БД  
  const loadRemainingQuestions = async () => {  
    try {  
      const response = await fetch(`/api/questions/${telegramId}`); // Запрос к вашему API  
      const data = await response.json();  
      if (data && data.remainingQuestions !== undefined) {  
        setRemainingQuestions(data.remainingQuestions);  
      } else {  
        setRemainingQuestions(initialQuestionsCount); // Если данных нет, устанавливаем начальное значение  
      }  
    } catch (error) {  
      console.error('Ошибка при загрузке оставшихся вопросов:', error);  
      setRemainingQuestions(initialQuestionsCount); // Устанавливаем начальное значение при ошибке  
    }  
  };  

  // Функция для сохранения оставшихся вопросов в БД  
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

  useEffect(() => {  
    if (telegramId) {  
      loadRemainingQuestions(); // Загружаем оставшиеся вопросы при наличии telegramId  
    }  
  }, [telegramId]);  

  const decrementQuestions = () => {  
    if (remainingQuestions > 0) {  
      const newCount = remainingQuestions - 1;  
      setRemainingQuestions(newCount);  
      saveRemainingQuestions(newCount); // Сохраняем новое количество вопросов в БД  
    }  
  };  

  const handleGetMoreQuestions = () => {  
    setRemainingQuestions(initialQuestionsCount);  
    saveRemainingQuestions(initialQuestionsCount); // Сохраняем начальное количество вопросов в БД  
    alert('Получение новых вопросов...');  
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