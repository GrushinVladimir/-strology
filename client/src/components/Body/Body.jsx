import { useTelegram } from '../hooks/useTelegram';  
import './Body.css';  
import React, { useEffect, useState } from 'react';  
import { useNavigate, Navigate } from 'react-router-dom'; 
import DatePicker from 'react-datepicker';
import './react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru'; 
import axios from 'axios';

registerLocale('ru', ru);

const Body = ({ handleStart }) => {  
  const { user } = useTelegram();  
  const [step, setStep] = useState(0); 
  const [day, setDay] = useState('');   
  const [month, setMonth] = useState('');   
  const [year, setYear] = useState('');   
  const [placeOfBirth, setPlaceOfBirth] = useState('');   
  const [username, setUsername] = useState('');  
  const [birthTime, setBirthTime] = useState(''); 
  const [unknownTime, setUnknownTime] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [zodiacSign, setZodiacSign] = useState(''); 
  const [isRegistered, setIsRegistered] = useState(false); 
  const navigate = useNavigate(); 
  const [startDate, setStartDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Функция для вычисления знака зодиака
  const getZodiacSign = (day, month) => {
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) {
      return "Водолей";
    } else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
      return "Рыбы";
    } else if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) {
      return "Овен";
    } else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) {
      return "Телец";
    } else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
      return "Близнецы";
    } else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) {
      return "Рак";
    } else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) {
      return "Лев";
    } else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) {
      return "Дева";
    } else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) {
      return "Весы";
    } else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) {
      return "Скорпион";
    } else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) {
      return "Стрелец";
    } else if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) {
      return "Козерог";
    }
  };

  // Проверка, зарегистрирован ли пользователь
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/checkUser', {
          params: {
            telegramId: user?.id
          }
        });

        if (response.data.exists) {
          setIsRegistered(true); // Если пользователь существует
        }
      } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
      }
    };

    checkUser();
  }, [user]);

  useEffect(() => {
    if (isRegistered) {
      navigate('/main'); // Если пользователь уже зарегистрирован
    }
  }, [isRegistered, navigate]);

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
    setErrorMessage('');
  };


  const handleStartClick = () => {
    handleNext();
  };

  const handleFinish = async () => {
    if (!day || !month || !year || !placeOfBirth || !username) {
      setErrorMessage('Пожалуйста, заполните все поля.');
      return;
    }

    const sign = getZodiacSign(day, month);
    setZodiacSign(sign);

    try {
      // Отправка данных пользователя на сервер для сохранения
      await axios.post('http://localhost:5000/api/users', {
        telegramId: user?.id,
        name: username,
        birthDate: `${day}.${month}.${year}`,
        birthTime: birthTime || 'Неизвестно',
        birthPlace: placeOfBirth,
        zodiacSign: sign
      });

      navigate('/main', { state: { zodiacSign: sign } });
    } catch (error) {
      console.error('Ошибка при сохранении данных пользователя:', error);
      setErrorMessage('Ошибка при сохранении данных пользователя.');
    }
  };

  const today = new Date();

  const handleDateChange = (date) => {
    setStartDate(date);
    setDay(date.getDate());
    setMonth(date.getMonth() + 1); 
    setYear(date.getFullYear());
  };

  const formatDate = (date) => {
    if (!date) {
      return (
        <span style={{ display: 'flex', margin: '0', alignItems: 'center', height: '47px' }}>
          <span style={{ marginLeft: '15px', marginRight: '15px', marginTop: '5px', marginBottom: '5px', borderRight: '1px solid #eee', paddingRight: '15px', lineHeight: '1.4rem' }}>День</span>
          <span style={{ marginRight: '15px', marginTop: '5px', marginBottom: '5px', borderRight: '1px solid #eee', paddingRight: '15px', lineHeight: '1.4rem' }}>Мес</span>
          <span style={{ marginRight: '15px', marginTop: '5px', marginBottom: '5px', paddingRight: '0px', lineHeight: '1.4rem' }}>Год</span>
        </span>
      );
    }

    const day = date.toLocaleDateString('ru-RU', { day: '2-digit' });
    const month = date.toLocaleDateString('ru-RU', { month: 'long' }); 
    const year = date.toLocaleDateString('ru-RU', { year: 'numeric' });

    return (
      <span style={{ display: 'flex', margin: '0' }}>
        <span style={{ marginLeft: '15px', marginRight: '15px', marginTop: '5px', marginBottom: '5px', borderRight: '1px solid #eee', paddingRight: '15px', lineHeight: '2.5rem' }}>{day}</span>
        <span style={{ marginRight: '15px', marginTop: '5px', marginBottom: '5px', borderRight: '1px solid #eee', paddingRight: '15px', lineHeight: '2.5rem' }}>{month}</span>
        <span style={{ marginRight: '15px', marginTop: '5px', marginBottom: '5px', paddingRight: '0px', lineHeight: '2.5rem' }}>{year}</span>
      </span>
    );
  };

  const renderStep = () => {  
    if (isRegistered) {
      return <Navigate to="/main" />; // Если пользователь уже зарегистрирован
    }
    
    switch (step) {  
      case 0 :  
        return (  
          <div className='body'>  
            <h2 style={{marginTop:'20vh'}}>  
              Давай знакомиться,<br />  
              {user?.username || user?.first_name || 'Неизвестный пользователь'}!  
            </h2>  
            <span style={{opacity:'.9'}}>  
              Ответь на несколько вопросов, чтобы мы могли узнать тебя лучше.  
            </span>  
            <button onClick={handleStartClick} className='button posi'><span>Начать</span></button>  
            <img src="img/forms/oblaco.png" alt="" className="oblaco"  />
          </div> 
        );  

      case 1:
        return (
          <div className='body'>
            <div className="top-container">
              <h2 style={{marginTop:'10vh'}}>Ваше имя</h2>
              <span style={{opacity:'.9'}}>Введите ваше имя, чтобы мы могли к вам обращаться.</span>
            </div>
            <div className="image-container">
              <img src="img/forms/imya.png" alt="" className="case-img"/>
            </div>
            <div className="center-container flex">
              <input 
                className="input-field"  
                type="text" 
                placeholder="Введите имя" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>   
            <div className="bottom-container ">
              <button onClick={() => {
                if (!username) {
                  setErrorMessage('Пожалуйста, введите ваше имя.');
                } else {
                  handleNext();
                }
              }} className='button'><span>Далее</span></button>
            </div> 
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>  
        );

      case 2:
        return (
          <div className='body'>
            <div className="top-container">
              <h2 style={{marginTop:'10vh'}}>Дата рождения</h2>
              <span style={{opacity:'.9'}}>Дата рождения нужна для определения вашего зодиакального знака.</span>
            </div>
            <div className="image-container" style={{marginBottom: '3vh'}}>
              <img className="case-img-ru" src="img/forms/Group 1.png" alt="" />
            </div>
            <div className="center-container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding:'0'}}>
                <div>
                  {!calendarOpen && (
                    <button  className='data'
                      onClick={() => setCalendarOpen(true)} 
                      style={{ 
                        padding: '6px 0px',
                        width:'210px',
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      {formatDate(startDate)}
                    </button>
                  )}
                  {calendarOpen && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgb(0 0 0 / 80%)', 
                      zIndex: 999, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{  
                        borderRadius: '10px',      
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)' 
                      }}>
                        <DatePicker
                          selected={startDate}
                          onChange={handleDateChange} 
                          dateFormat="dd/MM/yyyy"
                          inline 
                          popperPlacement="bottom"
                          showYearDropdown 
                          yearDropdownItemNumber={100}
                          scrollableYearDropdown 
                          maxDate={today} 
                          locale="ru" 
                        />
                        <button 
                          onClick={() => {
                            if (!startDate) {
                              setErrorMessage('Пожалуйста, выберите дату рождения.');
                            } else {
                              setCalendarOpen(false); 
                              setErrorMessage('');
                              handleNext();
                            }
                          }} 
                          className='button'
                          style={{
                            dislpay: 'block',
                            bottom: '0',
                            padding: '10px 20px',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            margin: '10px auto'
                          }}
                        >
                          Установить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        );

      case 3:
        return (
          <div className='body'>
            <div className="top-container">
              <h2 style={{marginTop:'10vh'}}>Время рождения</h2>
              <span style={{opacity:'.9'}}>Укажите время вашего рождения.</span>
            </div>
            <div className="image-container" style={{marginBottom: '3vh'}}>
              <img src="img/forms/time.png" alt="" className="case-img" />
            </div>
            <div className="center-container flex">
              <input 
                className="input-field"  
                type="time" 
                placeholder="Введите время" 
                value={birthTime} 
                onChange={(e) => setBirthTime(e.target.value)} 
              />
            </div>   
            <div className="bottom-container ">
              <button onClick={() => {
                if (!birthTime) {
                  setErrorMessage('Пожалуйста, введите время рождения.');
                } else {
                  handleNext();
                }
              }} className='button'><span>Далее</span></button>
            </div> 
            <button 
              onClick={() => {
                setBirthTime('Неизвестно');
                handleNext();
              }} 
              className='button na'
              style={{
                position: 'relative',
                margin: '2vh auto auto',
                display: 'block',
                left: 'unset',
                transform: 'none',
                padding: '6px 15px'
              }}
            >
              <span>Не знаю</span> 
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        );

      case 4:
        return (
          <div className='body'>  
            <div className="top-container">
              <h2 style={{marginTop:'10vh'}}>Место рождения</h2>  
              <span style={{padding:'0 1rem', margin: '0.6rem 0rem', opacity:'.9'}}>Указание места рождения поможет определить положение планет, Луны и звёзд.</span>  
            </div>
            <div className="image-container">
              <img src="img/forms/planet.png" alt="" style={{ maxWidth: '100%', height: 'auto', marginTop: '10%', marginBottom: '2rem', position: 'relative', right: '-27px' }}/>
            </div>
            <div className="center-container flex">
              <input className="input-field" value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder='Место рождения' />  
            </div>
            <div className="bottom-container">
              <button onClick={() => {
                if (!placeOfBirth) {
                  setErrorMessage('Пожалуйста, введите место рождения.');
                } else {
                  handleNext();
                }
              }} className='button'><span>Далее</span></button>  
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
          </div>  
        );

      case 5:
        return (
          <div className='body'>
            <h2>Ваши данные</h2>
            <p>Имя пользователя: {username}</p>
            <p>Дата рождения: {day}.{month}.{year}</p>
            <p>Время рождения: {birthTime}</p>
            <p>Место рождения: {placeOfBirth}</p>
            <p>Знак зодиака: {getZodiacSign(day, month)}</p>
            <div className="bottom-container ">
              <button onClick={handleFinish} className='button'><span>Завершить</span></button>  
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        );

      default:  
        return null;  
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default Body;
