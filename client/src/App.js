import './App.css';  
import { useTelegram } from './components/hooks/useTelegram';  
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
  const [step, setStep] = useState(0);  
  const [userName, setUserName] = useState('');  
  const [formData, setFormData] = useState({});  
  const [isUserExist, setIsUserExist] = useState(false);  
  const [telegramId, setTelegramId] = useState(null);  
  const [hasCheckedUser, setHasCheckedUser] = useState(false); // новое состояние  
  const navigate = useNavigate();  
  const initialQuestionsCount = 10;  
  const [remainingQuestions, setRemainingQuestions] = useState(initialQuestionsCount);  

  const loadRemainingQuestions = async () => {  
    try {  
      const response = await fetch(`/api/questions/${telegramId}`);  
      const data = await response.json();  
      if (data && data.remainingQuestions !== undefined) {  
        setRemainingQuestions(data.remainingQuestions);  
      } else {  
        setRemainingQuestions(initialQuestionsCount);  
      }  
    } catch (error) {  
      console.error('Ошибка при загрузке оставшихся вопросов:', error);  
      setRemainingQuestions(initialQuestionsCount);  
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

  useEffect(() => {  
    if (telegramId) {  
      loadRemainingQuestions();  
    }  
  }, [telegramId]);  

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
    tg.ready();  
  }, [tg]);  

  useEffect(() => {  
    async function checkUser() {  
      try {  
        const id = tg?.initDataUnsafe?.user?.id;  
        if (id) {  
          setTelegramId(id);  

          const response = await fetch(`/api/users/${id}`);  
          const data = await response.json();  

          if (data.exists) {  
            setIsUserExist(true);  
            if (!hasCheckedUser) {  
              setHasCheckedUser(true); // Устанавливаем флаг, что проверка пользователя завершена  
              navigate('/main');  
            }  
          } else {  
            console.warn('Пользователь не найден в БД.');  
            // Логика обработки случая, когда пользователь не найден  
          }  
        }  
      } catch (error) {  
        console.error('Ошибка при проверке пользователя:', error);  
      } finally {  
        tg.ready();  
      }  
    }  

    if (!hasCheckedUser) { // Проверяем, нужно ли делать проверку  
      checkUser();  
    }  
  }, [tg, hasCheckedUser, navigate]);  

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