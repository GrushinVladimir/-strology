import { useTelegram } from '../hooks/useTelegram';  
import './Body.css';  
import React, { useEffect, useState } from 'react';  
import { useNavigate } from 'react-router-dom'; 
import DatePicker from 'react-datepicker';
import './react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru'; 



registerLocale('ru', ru);
setDefaultLocale('ru'); 

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
    if (step === 1) {
        if (unknownTime) {
            // Если выбрано "Я не знаю времени", передаем null
            handleNext({ ...currentData, hour: null, minute: null });
            return;
        } else if (!hours[hourIndex] || !minutes[minuteIndex]) {
            setErrorMessage('Укажите время рождения или выберите "Я не знаю времени".');
            return;
        }
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


    const selectedHour = unknownTime ? null : hours[hourIndex];
    const selectedMinute = unknownTime ? null : minutes[minuteIndex];

    handleNext({ ...currentData, hour: selectedHour, minute: selectedMinute });
};


  const date = new Date();
  const localTimezoneOffset = date.getTimezoneOffset() * 60000; 
  const moscowTimezoneOffset = 3 * 60 * 60 * 1000; 

  const currentTimeInMoscow = new Date(date.getTime() + localTimezoneOffset + moscowTimezoneOffset);
  const initialHourIndex = currentTimeInMoscow.getHours();
  const initialMinuteIndex = currentTimeInMoscow.getMinutes();

  const [hourIndex, setHourIndex] = useState(initialHourIndex + 1); 
  const [minuteIndex, setMinuteIndex] = useState(initialMinuteIndex + 1); 

  const hours = ['', ...Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), ''];
  const minutes = ['', ...Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')), ''];


//scripts time bd
  useEffect(() => {
    if (step === 1) {
      const hourSelector = document.getElementById('hourSelector');
      const minuteSelector = document.getElementById('minuteSelector');
  
      const itemHeight = 30; 
  
      const centerItem = (selector, index) => {
        const offset = (selector.clientHeight / 2) - (itemHeight / 2); 
        const scrollToPosition = index * itemHeight - offset;
  
        selector.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      };
  
      if (hourSelector && minuteSelector) {
        centerItem(hourSelector, hourIndex);
        centerItem(minuteSelector, minuteIndex);
      }
  
      const handleScroll = (selector, setIndex, maxLength) => {
        let scrollTimeout;
  
        const scrollHandler = () => {
          clearTimeout(scrollTimeout);
  
          const currentScrollTop = selector.scrollTop;
          const midIndex = Math.floor((currentScrollTop + (selector.clientHeight / 2)) / itemHeight);
  
          if (midIndex >= 0 && midIndex < maxLength) {
            setIndex(midIndex);
          }
          scrollTimeout = setTimeout(() => {
            centerItem(selector, midIndex);
          }, 150); 
        };
  
        selector.addEventListener('scroll', scrollHandler);
        return () => {
          selector.removeEventListener('scroll', scrollHandler);
          clearTimeout(scrollTimeout);
        };
      };
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
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    
    setDay(day); 
    setMonth(month);
    setYear(year);
  };


  const formatDate = (date) => {
    if (!date) {
      return (
        <span style={{ display: 'flex', margin: '0'  ,  alignItems: 'center', 
          height: '47px'
}}>
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
 

  

  //forms
  const renderStep = () => {  
    switch (step) {  
      case 0 :  
        return (  
          <div className='body'>  
            <h2 style={{marginTop:'20vh'}}>  
              Давай знакомится,<br />  
              {user?.username || user?.first_name || userName || 'Неизвестный пользователь'}!  
            </h2>  
            <p style={{opacity:'.9'}}>  
              Ответь на 5 простых вопросов. <br />  
              Это поможет нам узнать тебя получше.  
            </p>  
            <button onClick={handleStart} className='button'><span>Начать</span></button>  
          </div>  
        );  
  
        case 1:
          return (
            <div className='body'>
            <h2 style={{marginTop:'10vh'}}>Время рождения</h2>
            <span>Время рождения нужно для определения вашего солнечного знака.</span>
           <img src="img/forms/time.png" alt="" 
           className="case-img"
            />
            <div className="time-selector">
                <div className="scroll-container" id="hourSelector">
                    {hours.map((hour, index) => (
                        <div key={index} className={`item ${index === hourIndex ? 'visible' : 'transparent'}`}>
                            {hour}
                        </div>
                    ))}
                   
                </div>
                <span>:</span>
                <div className="scroll-container" id="minuteSelector">
                    {minutes.map((minute, index) => (
                        <div key={index} className={`item ${index === minuteIndex ? 'visible' : 'transparent'}`}>
                            {minute}
                        </div>
                    ))}
                </div>
            </div>  
            <button 
                onClick={() => {
                    setUnknownTime(true); 
                    setHourIndex(0); 
                    setMinuteIndex(0); 
                    handleNextWithValidation({ hour: null, minute: null });
                }}    
                className='button na'
                style={{
                  position: 'relative',
                  margin: '3rem auto',
                  display: 'block',
                  left: 'unset',
                  transform: 'none',
                  padding: '6px 15px'
                }}
            >
              <span>Не знаю</span> 
            </button>

            <button 
                onClick={() => handleNextWithValidation({})} 
                className='button'
            >
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <span>Далее</span>
            </button>
        </div>
          );
  
          case 2:  
          return (  
            <div className='body'>
              <h2 style={{marginTop:'10vh'}}>Дата рождения</h2>
              <span>Дата рождения нужна для определения вашего зодиакального знака.</span>
              <br />
              <img className="case-img" src="img/forms/Group 1.png" alt="" 
           
            />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding:'0'
          


              }}>
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
                      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
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
                            setCalendarOpen(false); 
                           
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
                            width: '345px'
                          }}
                        >
                          Установить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => handleNextWithValidation({ day, month, year })} className='button'><span>Далее</span></button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
          ); 
  
      case 3:  
        return (  
          <div className='body'>  
            <h2 style={{marginTop:'10vh'}}>Место рождения</h2>  
            <span style={{padding:'0 1rem',    margin: '0.6rem 0rem'}}>Указание места рождения (страна и город) поможет определить положение планет, Луны и звёзд.</span>  
            <img src="img/forms/planet.png" alt="" 
            style={{ maxWidth: '100%', height: 'auto',marginTop: '10%',marginBottom: '2rem',position: 'relative',right: '-27px' }}
            />
            
            <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder='Место рождения' />  
            <button onClick={() => handleNextWithValidation({ placeOfBirth })} className='button'><span>Далее</span></button>  
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>  
        );  
  
        case 4:  
    return (  
      <div className='body'>  
        <h2 style={{marginTop:'10vh'}}>Ваше имя</h2>  
        <span>Введите ваше имя, чтобы мы могли к вам обращаться.</span>  
        <img src="img/forms/imya.png" alt="" 
            style={{ maxWidth: '100%', height: 'auto',marginTop: '20%',marginBottom: '2rem' }} />
        <input type="text" placeholder="Введите имя" value={username} onChange={(e) => setUsername(e.target.value)} />
        <button onClick={() => handleNextWithValidation({ username })} className='button'><span>Далее</span></button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
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
      <button onClick={() => handleFinish()} className='button'><span>Завершить</span></button>  
    </div>
        
      );
  default:  
    return null;  
}  
  };  
  
  return <>{renderStep()}</>;  
};  
  
export default Body;

