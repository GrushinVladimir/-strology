import React, { useEffect, useState } from 'react';  
import { useTelegram } from '../hooks/useTelegram';  
import { Link } from 'react-router-dom';  
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';  

const Zadaniya = ({ telegramId }) => {  
  const navigate = useNavigate();  
  const { user } = useTelegram();  
  const [userData, setUserData] = useState(null);  
  const [isTestCompleted, setTestCompleted] = useState(false);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  

  const fetchUserData = async () => {  
    try {  
      const response = await axios.get(`/api/users/${telegramId}`);  
      if (response.data && response.data.user) {  
        setUserData(response.data.user);  
      } else {  
        console.error('Данные пользователя не найдены');  
        setError('Данные пользователя не найдены');  
      }  
    } catch (error) {  
      console.error('Ошибка при получении данных пользователя:', error);  
      setError('Ошибка при получении данных пользователя');  
    } finally {  
      setLoading(false);  
    }  
  };  

  const fetchTestResults = async () => {  
    try {  
      const response = await axios.get(`/api/test-results/${telegramId}`);  
      if (response.data && response.data.length > 0) {  
        setTestCompleted(true); // Тест пройден, если есть результаты  
      } else {  
        setTestCompleted(false); // Тест не пройден  
      }  
    } catch (error) {  
      console.error('Ошибка при получении результатов теста:', error);  
      setTestCompleted(false);  
    }  
  };  

  useEffect(() => {  
    if (!telegramId) return;  
    fetchUserData();  
    fetchTestResults();  
    const intervalId = setInterval(fetchUserData, 10000); // Повторный запрос каждые 10 секунд  
    return () => clearInterval(intervalId);  
  }, [telegramId]);  

  // Обработка состояния загрузки и ошибок  
  if (loading) return <p>Загрузка...</p>;  
  if (error) return <p>{error}</p>;  

  return (  
    <div>  
      {/* Отображение пользователя */}  
      {userData && <h1>Привет, {userData.name}</h1>}  
      
      {/* Уведомление о завершении теста */}  
      <div>  
        <span>Статус теста: {isTestCompleted ? 'Пройден' : 'Не пройден'}</span>  
      </div>  

      {/* Пример меню навигации */}  
      <div className="menu">  
        <Link to="/">  
          <img src="img/menu/Union.png" alt="Главная" />  
          <span>Главная</span>  
        </Link>  
        <Link to="/chat"> {/* Изменено на Link для чата */}  
          <img src="img/menu/chat.png" alt="Чат" />  
          <span>Чат</span>  
        </Link>  
        <Link to="/profile">  
          <img src="img/menu/profile.png" alt="Профиль" style={{ width: '13px' }} />  
          <span>Профиль</span>  
        </Link>  
      </div>  
    </div>  
  );  
};  

export default Zadaniya;  