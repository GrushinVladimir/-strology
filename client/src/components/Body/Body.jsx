import { useTelegram } from '../hooks/useTelegram';  
import './Body.css';  
import React, { useEffect, useState } from 'react';  
import { useNavigate } from 'react-router-dom'; 
import DatePicker from 'react-datepicker';
import './react-datepicker.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru'; 
import axios from 'axios';
import LazyLoad from 'react-lazyload';

registerLocale('ru', ru);
setDefaultLocale('ru'); 

const Body = ({ step, userName, handleStart, handleNext, formData }) => {  
  const { user } = useTelegram();  
  const [day, setDay] = useState('');   
  const [month, setMonth] = useState('');   
  const [year, setYear] = useState('');   
  const [placeOfBirth, setPlaceOfBirth] = useState('');   
  const [username, setUsername] = useState('');  
  const [birthTime, setBirthTime] = useState(''); // Добавлено состояние для birthTime
  const [unknownTime, setUnknownTime] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // для отображения ошибки
  const [zodiacSign, setZodiacSign] = useState(''); // для хранения знака зодиака
  const navigate = useNavigate(); // для редиректа
  const [isVisible, setIsVisible] = useState(false);


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
  const zodiacInfo = {
    "Водолей": "Водолеи известны своей независимостью и оригинальностью.",
    "Рыбы": "Рыбы сочетают в себе мечтательность и чувствительность.",
    "Овен": "Овны известны своей энергией и настойчивостью.",
    "Телец": "Тельцы отличаются стабильностью и практичностью.",
    "Близнецы": "Близнецы известны своей общительностью и любознательностью.",
    "Рак": "Раки ценят семью и домашний уют.",
    "Лев": "Львы известны своим харизматичным характером и стремлением быть в центре внимания.",
    "Дева": "Девы известны своим трудолюбием, организованностью и стремлением к порядку. Они редко мечтают о чем-то несбыточном, предпочитая практические и реалистичные подходы. Этот знак также ассоциируется со справедливостью и чистотой.",
    "Весы": "Весы отличаются стремлением к гармонии и справедливости, они ценят отношения и партнерство.",
    "Скорпион": "Скорпионы известны своей страстью, интенсивностью и загадочностью.",
    "Стрелец": "Стрельцы оптимистичны и любят приключения, ищут знания и новые впечатления.",
    "Козерог": "Козероги известны своей целеустремленностью, дисциплиной и прагматизмом."
};

  const handleFinish = async () => {  
    if (!day || !month || !year || !placeOfBirth || !username) {  
        setErrorMessage('Пожалуйста, заполните все поля.');  
        return;  
    }  

    const sign = getZodiacSign(day, month);  
    setZodiacSign(sign);  
    const zodiacDescription = zodiacInfo[sign] || "Информация о знаке зодиака не найдена.";

    const userData = {  
      telegramId: user?.id,  
      name: username,  
      birthDate: `${year}-${month}-${day}`, // Приведите к формату YYYY-MM-DD  
      birthTime: birthTime || 'Неизвестно',  
      birthPlace: placeOfBirth,  
      zodiacSign: sign,  
      zodiacDescription: zodiacDescription, // Добавляем описание знака зодиака
  };  

    console.log('Данные для отправки:', userData); // Логируем данные  

    try {  
        await axios.post('https://strology.vercel.app/api/users', userData);  
        navigate('/main', { state: { zodiacSign: sign } });  
    } catch (error) {  
        console.error('Ошибка при сохранении данных пользователя:', error.response?.data || error.message);  
        setErrorMessage('Ошибка при сохранении данных пользователя.');  
    }  
};  

const [visible, setVisible] = useState(true);  
const handleStartWithAnimation = () => {  
  setVisible(false); // Убираем элемент для анимации  
  setTimeout(() => {  
      handleStart(); // Ждем, чтобы анимация завершилась  
      setVisible(true); // Возвращаем элемент в видимое состояние  
  },400); // Время анимации  
}; 

const handleNextWithValidation = (currentData) => {  
  setErrorMessage(''); // Сброс сообщения об ошибке  

  // Валидация для каждого шага  
  if (step === 1) {  
      if (unknownTime) {  
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

  // Начинаем анимацию исчезновения  
  setVisible(false);  

  // Ждем завершения анимации, затем переходим к следующему шагу  
  setTimeout(() => {  
      handleNext({ ...currentData, hour: selectedHour, minute: selectedMinute });  
      setVisible(true); // Показать следующий шаг  
  }, 400); // 500 мс соответствует времени анимации  
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
  useEffect(() => {
    // Устанавливаем таймер для плавного появления изображения
    const timer = setTimeout(() => {
        setIsVisible(true);
    }, 0); // Задержка перед появлением (в миллисекундах)

    return () => clearTimeout(timer); // Очищаем таймер при размонтировании
}, []);

  const formatDate = (date) => {
    if (!date) {
      return (
        <span style={{ display: 'flex', margin: '0'  ,  alignItems: 'center', 
          height: '47px',justifyContent: 'center'
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
      <span style={{ display: 'flex', margin: '0',justifyContent: 'center' }}>
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
          <div className={`body step ${visible ? 'fade-in' : 'fade-out'}`}>
            <h2 style={{marginTop:'20vh'}}>  
              Давай знакомится!<br />  
            </h2>  
            <span style={{opacity:'.9'}}>  
              Ответь на 4 простых вопросов. <br />  
              Это поможет нам узнать тебя получше.  
            </span>  
            <button onClick={handleStartWithAnimation} className='button posi'><span>Начать</span></button>  
            <img src="img/forms/oblaco.png" alt="" className="oblaco"  />
          </div> 
           

        );  
  
        case 1:
          return (
            <div className={`body step ${visible ? 'fade-in' : 'fade-out'}`}>
              <div className="top-container">
                <h2 style={{marginTop:'10vh'}}>Время рождения</h2>
                <span style={{opacity:'.9'}}>Время рождения нужно для определения вашего солнечного знака.</span>
            </div>
            <div className="image-container" style={{marginBottom: '3vh'}}>
                <img src="img/forms/time.png" alt="" className={`case-img ${isVisible ? 'visible' : ''}`}/>
            </div>
            <div className="center-container">
                <div className="time-selector">
                    <div className="scroll-container" id="hourSelector">
                        {hours.map((hour, index) => (
                            <div 
                                key={index} 
                                className={`item ${index === hourIndex ? 'visible' : 'transparent'}`}
                                onClick={() => setHourIndex(index)} // Установка выбранного часа
                            >
                                {hour}
                            </div>
                        ))}
                    </div>
                    <span style={{marginTop: '1.01rem'}}>:</span>
                    <div className="scroll-container" id="minuteSelector">
                        {minutes.map((minute, index) => (
                            <div 
                                key={index} 
                                className={`item ${index === minuteIndex ? 'visible' : 'transparent'}`}
                                onClick={() => setMinuteIndex(index)} // Установка выбранной минуты
                            >
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
                        margin: '2vh auto auto',
                        display: 'block',
                        left: 'unset',
                        transform: 'none',
                        padding: '6px 15px'
                    }}
                >
                    <span>Не знаю</span> 
                </button>
            </div>
            <div className="bottom-container">
                <button 
                    onClick={() => handleNextWithValidation({ hour: hours[hourIndex], minute: minutes[minuteIndex] })} 
                    className='button'
                >
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <span>Далее</span>
                </button>
                </div>
            </div>
              );
      
              case 2:  
              return (  
                <div className={`body step ${visible ? 'fade-in' : 'fade-out'}`}>
                  <div className="top-container">
                    <h2 style={{marginTop:'10vh'}}>Дата рождения</h2>
                    <span style={{opacity:'.9'}}>Дата рождения нужна для определения вашего зодиакального знака.</span>
                  </div>
                  <div className="image-container" style={{marginBottom: '3vh'}}>
                  <LazyLoad height={200} offset={100}>

                    <img className="case-img-ru" src="img/forms/Group 1.png" alt="" />

                  </LazyLoad>

                  </div>
                  <div className="center-container">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding:'0'
              


                  }}>
                    <div>
                      {!calendarOpen && (
                        <button  className='data'
                          onClick={() => setCalendarOpen(true)} 
                          style={{ 
                            padding: '6px 0px',
                            minWidth:'210px',
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
                                setCalendarOpen(false); 
                              
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
              <div className="bottom-container">
                <button onClick={() => handleNextWithValidation({ day, month, year })} className='button'><span>Далее</span></button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
            </div>
          ); 
  
      case 3:  
        return (  
          <div className={`body step ${visible ? 'fade-in' : 'fade-out'}`}>
          <div className="top-container">
              <h2 style={{marginTop:'10vh'}}>Место рождения</h2>  
              <span style={{padding:'0 1rem',    margin: '0.6rem 0rem',opacity:'.9'}}>Указание места рождения (страна и город) поможет определить положение планет, Луны и звёзд.</span>  
          </div>
          <div className="image-container">
          <LazyLoad height={200} offset={100}>
            <img src="img/forms/planet.png" alt=""  className={`case-img ${isVisible ? 'visible' : ''}`}
      
            />
               </LazyLoad>
          </div>
          <div className="center-container  flex">
            <input className="input-field " value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder='Место рождения' />  
          </div>
          <div className="bottom-container">
            <button onClick={() => handleNextWithValidation({ placeOfBirth })} className='button'><span>Далее</span></button>  
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
          </div>  
        );  
  
        case 4:  
    return (  
      <div className='body'>  
      <div className="top-container">
        <h2 style={{marginTop:'10vh'}}>Ваше имя</h2>  
        <span style={{opacity:'.9'}}>Введите ваше имя, чтобы мы могли к вам обращаться.</span>  
      </div>
      <div className="image-container">
      <LazyLoad height={200} offset={100}>

          <img src="img/forms/imya.png" alt=""  className={`case-img ${isVisible ? 'visible' : ''}`}
              />
               </LazyLoad>
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
      <button   
        onClick={() => {  
          // Предполагается, что variable username доступен внутри этой функции или получен из состояния  
          handleNextWithValidation({ username });  
          handleFinish();  
        }}   
        className='button'>  
        <span>Завершить</span>  
      </button>      
      </div> 
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

