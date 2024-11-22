import React, { useEffect, useState } from 'react';  
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';  
import Body from './Body'; // Предположим, что у вас есть этот компонент  
import MainPage from './MainPage';  
import ProfilePage from './ProfilePage';  
import Test from './Test';  
import FAQPage from './FAQPage';  
import Zadaniya from './Zadaniya';  
import ChatPage from './ChatPage';  

const App = () => {  
  const [userName, setUserName] = useState('');  
  const [step, setStep] = useState(0);  
  const [formData, setFormData] = useState({});  
  const [remainingQuestions, setRemainingQuestions] = useState(5); // Пример начального количества вопросов  
  const [telegramId, setTelegramId] = useState(null); // Это состояние должно инициализироваться соответствующим образом  
  const initialQuestionsCount = 5; // Укажите исходное значение здесь  
  const navigate = useNavigate();  

  useEffect(() => {  
    // Пример проверки telegramId и возможного перехода на другую страницу  
    if (telegramId) {  
      navigate('/main');  
    }  
  }, [telegramId, navigate]);  

  const saveRemainingQuestions = (count) => {  
    // Сохраните оставшиеся вопросы (может быть в localStorage или API)  
    console.log(`Remaining questions updated: ${count}`);  
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

  const handleStart = () => {  
    setStep(1);  
  };  

  const handleNext = (data) => {  
    setFormData((prev) => ({ ...prev, ...data }));  
    setStep((prev) => prev + 1);  
  };  

  const renderBody = () => {  
    if (!userName) {  
      return <div>Please log in to continue.</div>; // Предоставить альтернативный UI, если имя пользователя отсутствует  
    }  
    return (  
      <Body  
        step={step}  
        userName={userName}  
        handleStart={handleStart}  
        handleNext={handleNext}  
        formData={formData}  
      />  
    );  
  };  

  return (  
    <div className="App">  
      <Routes>  
        <Route path="/" element={renderBody()} />  
        <Route path="/main" element={<MainPage telegramId={telegramId} />} />  
        <Route path="/profile" element={<ProfilePage telegramId={telegramId} />} />  
        <Route path="/test" element={<Test />} />  
        <Route path="/faq" element={<FAQPage />} />  
        <Route path="/zadaniya" element={<Zadaniya telegramId={telegramId} remainingQuestions={remainingQuestions} handleGetMoreQuestions={handleGetMoreQuestions} />} />  
        <Route path="/chat" element={<ChatPage remainingQuestions={remainingQuestions} decrementQuestions={decrementQuestions} />} />  
      </Routes>  
    </div>  
  );  
};  

export default function AppWithRouter() {  
  return (  
    <Router>  
      <App />  
    </Router>  
  );  
}  