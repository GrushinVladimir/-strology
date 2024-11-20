import React, { useEffect, useState } from 'react';  
import { useTelegram } from '../hooks/useTelegram';  
import { Link } from 'react-router-dom';  
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';   

const Zadaniya = ({ telegramId, remainingQuestions, setRemainingQuestions, handleGetMoreQuestions }) => {  
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
    const intervalId = setInterval(fetchUserData, 10000);  
    return () => clearInterval(intervalId);  
  }, [telegramId]);   


  return (  
    <div className='Zadaniys'>  
      <div className='body-zadaniya'>  
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}} className='body-test'>  
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">  
            <circle cx="11.5" cy="11.5" r="11" stroke="white"/>  
            <path d="M7.64645 11.6464C7.45118 11.8417 7.45118 12.1583 7.64645 12.3536L10.8284 15.5355C11.0237 15.7308 11.3403 15.7308 11.5355 15.5355C11.7308 15.3403 11.7308 15.0237 11.5355 14.8284L8.70711 12L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L7.64645 11.6464ZM16 11.5L8 11.5V12.5L16 12.5V11.5Z" fill="white"/>  
          </svg>  
        </button>  
        <div className="zadaniya-block" style={{width:'100%',margin:'0', padding: '0px'}}>  
          <span style={{paddingLeft: '2vh'}}>Выполнено заданий:</span>  
          <span style={{paddingRight: '2vh'}}>0 / 10</span>  
        </div>  
        <div className="zadaniya-block">  
          <span className='left'>Пригласить друга по реферальной ссылке: <span>1</span></span>  
          <span className='right'>Х 6</span>  
        </div>  
        <div className="zadaniya-block">  
          <span style={{ width: '60%', textAlign: 'left'}}>Заполнить профиль </span>  
          <span className='right'>Получить</span>  
        </div>  
        <div className="zadaniya-block">  
          <span className='left'>Задачать чат-боту вопросов о своём знаке: 3</span>  
          {remainingQuestions > 0 ? (  
        <span className='right'>X {remainingQuestions} </span>  
      ) : (  
        <span className='right'>Получить</span> 
      )}  
        </div>  
        
        {/* Здесь изменяем текст в зависимости от состояния теста */}  
        <div className="zadaniya-block">  
          <span className='left'>Заполнить характеристики вашего знака: 2</span>  
          <span className='right'>{isTestCompleted ? 'Получить' : 'Не выполнено'}</span>  
        </div>  
      </div>   

      <div className="menu">  
        <Link to="/">  
          <img src="img/menu/Union.png" alt="Главная" />  
          <span>Главная</span>  
        </Link>  
        <a href="">  
          <img src="img/menu/chat.png" alt="Чат" />  
          <span>Чат</span>  
        </a>  
        <Link to="/profile">  
          <img src="img/menu/profile.png" alt="Профиль" style={{ width: '13px' }} />  
          <span>Профиль</span>  
        </Link>  
      </div>  
    </div>   
  );  
};  

export default Zadaniya;  