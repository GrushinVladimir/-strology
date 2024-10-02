import { useTelegram } from '../hooks/useTelegram';  
import './Body.css';  
import React, { useEffect, useState } from 'react';  
import { useNavigate } from 'react-router-dom'; // для редиректа

const Body = ({ step, userName, handleStart, handleNext, formData }) => {  
  const { user } = useTelegram();  
  const [day, setDay] = useState('');   
  const [month, setMonth] = useState('');   
  const [year, setYear] = useState('');   
  const [placeOfBirth, setPlaceOfBirth] = useState('');   
  const [username, setUsername] = useState('');  
  const [unknownTime, setUnknownTime] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // для отображения ошибки
  const [zodiacSign, setZodiacSign] = useState(''); // для хранения знака зодиака
  const navigate = useNavigate(); // для редиректа

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

  const handleFinish = () => {
    if (!day || !month || !year || !placeOfBirth || !username) {
      setErrorMessage('Пожалуйста, заполните все поля.');
      return;
    }

    const sign = getZodiacSign(day, month);
    setZodiacSign(sign);
    navigate('/main', { state: { zodiacSign: sign } });
  };

  const handleNextWithValidation = (currentData) => {
    setErrorMessage(''); // сброс сообщения об ошибке

    // Валидация для каждого шага
    if (step === 1 && (!hours && !unknownTime)) {
      setErrorMessage('Укажите время рождения или выберите "Я не знаю времени".');
      return;
    }

    if (step === 2 && (!day || !month || !year)) {
      setErrorMessage('Заполните все поля даты рождения.');
      return;
    }

    if (step === 3 && !placeOfBirth) {
      setErrorMessage('Заполните поле места рождения.');
      return;
    }

    if (step === 4 && !username) {
      setErrorMessage('Введите ваше имя.');
      return;
    }

    // Переход на следующий шаг, если валидация пройдена
    handleNext(currentData);
  };

  // Получаем текущее время в Москве
  const date = new Date();
  const localTimezoneOffset = date.getTimezoneOffset() * 60000; // Смещение в миллисекундах
  const moscowTimezoneOffset = 3 * 60 * 60 * 1000; // UTC+3 (Московское время)

  // Установка текущего времени
  const currentTimeInMoscow = new Date(date.getTime() + localTimezoneOffset + moscowTimezoneOffset);
  const initialHourIndex = currentTimeInMoscow.getHours();
  const initialMinuteIndex = currentTimeInMoscow.getMinutes();

  const [hourIndex, setHourIndex] = useState(initialHourIndex + 1); // Начинаем с +1 для учета пустого места
  const [minuteIndex, setMinuteIndex] = useState(initialMinuteIndex + 1); // Начинаем с +1 для учета пустого места

  const hours = ['', ...Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), ''];
  const minutes = ['', ...Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')), ''];
  useEffect(() => {
    if (step === 1) {
      const hourSelector = document.getElementById('hourSelector');
      const minuteSelector = document.getElementById('minuteSelector');
  
      const itemHeight = 30; // Height of each item
  
      // Function to center the item smoothly
      const centerItem = (selector, index) => {
        const offset = (selector.clientHeight / 2) - (itemHeight / 2); // Offset for centering
        const scrollToPosition = index * itemHeight - offset;
  
        // Using smooth scroll behavior
        selector.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      };
  
      // Initialize selectors
      if (hourSelector && minuteSelector) {
        centerItem(hourSelector, hourIndex);
        centerItem(minuteSelector, minuteIndex);
      }
  
      // Debounced scroll handler
      const handleScroll = (selector, setIndex, maxLength) => {
        let scrollTimeout;
  
        const scrollHandler = () => {
          clearTimeout(scrollTimeout);
  
          const currentScrollTop = selector.scrollTop;
          const midIndex = Math.floor((currentScrollTop + (selector.clientHeight / 2)) / itemHeight);
  
          // Ensure the index is within the array bounds
          if (midIndex >= 0 && midIndex < maxLength) {
            setIndex(midIndex);
          }
  
          // Set timeout to center after scrolling stops
          scrollTimeout = setTimeout(() => {
            centerItem(selector, midIndex);
          }, 150); // Increased delay for smoother behavior
        };
  
        selector.addEventListener('scroll', scrollHandler);
        return () => {
          selector.removeEventListener('scroll', scrollHandler);
          clearTimeout(scrollTimeout);
        };
      };
  
      // Setup scroll handling
      handleScroll(hourSelector, setHourIndex, hours.length);
      handleScroll(minuteSelector, setMinuteIndex, minutes.length);
    }
  }, [step, hourIndex, minuteIndex]);

  const renderStep = () => {  
    switch (step) {  
      case 0:  
        return (  
          <div className='body'>  
            <h2 className={'username'}>  
              Давай знакомится,<br />  
              {user?.username || user?.first_name || userName || 'Неизвестный пользователь'}!  
            </h2>  
            <p>  
              Ответь на 5 простых вопросов. <br />  
              Это поможет нам узнать тебя получше.  
            </p>  
            <button onClick={handleStart} className='button'>Начать</button>  
          </div>  
        );  
  
        case 1:
          return (
            <div className='body'>
            <h2>Время рождения</h2>
            <span>Время рождения нужно для определения вашего солнечного знака.</span>
            <div className="time-selector">
              <div className="scroll-container" id="hourSelector">
                {hours.map((hour, index) => (
                  <div key={index} className={`item ${index === hourIndex ? 'visible' : 'transparent'}`}>
                    {hour}
                  </div>
                ))}
              </div>
              <div className="scroll-container" id="minuteSelector">
                {minutes.map((minute, index) => (
                  <div key={index} className={`item ${index === minuteIndex ? 'visible' : 'transparent'}`}>
                    {minute}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => handleNext({ hour: hours[hourIndex], minute: minutes[minuteIndex] })} className='button'>
              Далее
            </button>
          </div>
          );
  
      case 2:  
        return (  
          <div className='body'>  
          <h2>Дата рождения</h2>   
          <span>Дата рождения нужна для определения вашего зодиакального знака.</span>   
          <br />  
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>   
            <div>  
              <input  
                type="number"  
                min="1"  
                max="31"  
                value={day}  
                onChange={(e) => setDay(e.target.value)}  
                placeholder="День" 
              />  
            </div>  
            <div style={{ marginLeft: '10px' }}>  
              <input  
                type="number"  
                min="1"  
                max="12"  
                value={month}  
                onChange={(e) => setMonth(e.target.value)}  
                placeholder="Месяц" 
              />  
            </div>  
            <div style={{ marginLeft: '10px' }}>  
              <input  
                type="number"  
                value={year}  
                onChange={(e) => setYear(e.target.value)}  
                placeholder="Год" 
              />  
            </div>  
          </div>  
          <button onClick={() => handleNextWithValidation({ day, month, year })} className='button'>Далее</button>  
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>  
        ); 
  
      case 3:  
        return (  
          <div className='body'>  
            <h2>Место рождения</h2>  
            <p>Укажите место, где вы родились.</p>  
            <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder='Место рождения' />  
            <button onClick={() => handleNextWithValidation({ placeOfBirth })} className='button'>Далее</button>  
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>  
        );  
  
        case 4:  
    return (  
      <div className='body'>  
        <h2>Ваше имя</h2>  
        <p>Введите ваше имя, чтобы мы могли к вам обращаться.</p>  
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Ваше имя' />  
        <button onClick={() => handleFinish()} className='button'>Завершить</button>  
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>  
    );  

  default:  
    return null;  
}  
  };  
  
  return <>{renderStep()}</>;  
};  
  
export default Body;

