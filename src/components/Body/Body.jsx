import { useTelegram } from '../hooks/useTelegram';  
import './Body.css';  
import React, { useEffect, useState } from 'react';  
import { useNavigate } from 'react-router-dom'; // для редиректа
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru'; // Импортируем русскую локаль


// Регистрируем русскую локаль
registerLocale('ru', ru);
setDefaultLocale('ru'); // Устанавливаем её по умолчанию

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


  const [startDate, setStartDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);


  const today = new Date();

  const handleDateChange = (date) => {
    setStartDate(date);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();
    
    // Update the state with new values
    setDay(day); 
    setMonth(month);
    setYear(year);
  };


  const formatDate = (date) => {
    if (!date) {
      return (
        <span style={{ display: 'flex', margin: '0' }}>
          <span style={{ marginLeft: '15px', marginRight: '15px', marginTop: '5px', marginBottom: '5px', borderRight: '1px solid #eee', paddingRight: '15px', lineHeight: '2.5rem' }}>День</span>
          <span style={{ marginRight: '15px', marginTop: '5px', marginBottom: '5px', borderRight: '1px solid #eee', paddingRight: '15px', lineHeight: '2.5rem' }}>Мес</span>
          <span style={{ marginRight: '15px', marginTop: '5px', marginBottom: '5px', paddingRight: '0px', lineHeight: '2.5rem' }}>Год</span>
        </span>
      );
    }
  
    const day = date.toLocaleDateString('ru-RU', { day: '2-digit' });
    const month = date.toLocaleDateString('ru-RU', { month: 'long' }); // или '2-digit'
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
                  {!calendarOpen && (
                    <button 
                      onClick={() => setCalendarOpen(true)} 
                      style={{ 
                        padding: '15px 30px',
                        background: '#7e5f8f',
                        fontSize: '20px',
                        borderRadius: '40px',
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      {formatDate(startDate)}
                    </button>
                  )}
                  
                  {/* Overlay */}
                  {calendarOpen && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
                      zIndex: 999, // Ensure it appears above other elements
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
                          onChange={handleDateChange} // Ensure this updates the state
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
                            setCalendarOpen(false); // Close the calendar
                           
                          }} 
                          className='button'
                          style={{
                            position: 'relative',
                            bottom: '0',
                            marginTop: '10px',
                            padding: '10px 20px',
                            background: '#7e5f8f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            width: '245px'
                          }}
                        >
                          Установить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => handleNext({ day, month, year })} className='button'>Далее</button>
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
        <input type="text" placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} />
        <button onClick={() => handleNext({ username })} className='button'>Далее</button>
     
      </div>  
    );  

    case 5:
      return (
    <div className='body'>
      <h2>Ваши данные</h2>
      <p>Время рождения: {hours[hourIndex]}:{minutes[minuteIndex]}</p>
      <p>Дата рождения: {day}.{month}.{year}</p>
      <p>Место рождения: {placeOfBirth}</p>
      <p>Имя пользователя: {username}</p>
      <button onClick={() => handleFinish()} className='button'>Завершить</button>  
    </div>
        
      );
  default:  
    return null;  
}  
  };  
  
  return <>{renderStep()}</>;  
};  
  
export default Body;

