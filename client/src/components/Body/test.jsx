import './Body.css';  
import React, { useState } from 'react';  
import './react-datepicker.css';  
import { useNavigate } from 'react-router-dom';  
import axios from 'axios';  // Импортируем axios  
import { useTelegram } from '../hooks/useTelegram';  

const questions = [  
  {  
    question: "Вы бы предпочли работать с людьми или с техникой?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вы больше интроверт или экстраверт?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Выберите ту деятельность, в которой вы чувствуете себя комфортно?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вопрос 4?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вопрос 5?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вопрос 6?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вопрос 7?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вопрос 8?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вопрос 9?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
  {  
    question: "Вопрос 10?",  
    description: "Выберите один ответ",  
    options: ["Ответ A", "Ответ B", "Ответ C"],  
  },  
];  

const Test = () => {  
  const { telegramId } = useTelegram();
  const navigate = useNavigate();  
  const [step, setStep] = useState(0);  
  const [selectedOption, setSelectedOption] = useState(null);  
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));  

  const handleOptionClick = (index) => {  
    setSelectedOption(index);  
  };  

  const handleNextClick = () => {  
    if (selectedOption !== null) {  
      const updatedAnswers = [...answers];  
      updatedAnswers[step] = selectedOption;  
      setAnswers(updatedAnswers);  
      setSelectedOption(null);  
      setStep((prevStep) => prevStep + 1);  
    }  
  };  

  const handleFinish = async () => {  
    // Формируем объект с результатами теста  
    const testResults = {  
      answers,  
      dateCompleted: new Date().toISOString(),  
      userId: telegramId, // Здесь укажите ID пользователя, если есть такой идентификатор  
    };  

    try {  
      // Отправляем результаты на сервер  
      await axios.post('https://strology.vercel.app/api/test-results', testResults);  
      // Перенаправляем на профиль по завершении  
      navigate('/profile');  
    } catch (error) {  
      console.error('Ошибка при сохранении результатов теста:', error.response?.data || error.message);  
      // Можно добавить обработку ошибки, например, вывести уведомление  
    }  
  };  

  const renderStep = () => {  
    if (step >= questions.length) {  
      return (  
        <div className='body'>  
         
          <button className='button' onClick={handleFinish} style={{position: 'absolute',
    bottom:' 10vh',
    transform: 'translateX(-50%)',right:'50%'}}>Завершить</button>  
        </div>  
      );  
    }  

    const { question, description, options } = questions[step];  

    return (  
      <div className='body'>  
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}} className='body-test'>  
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">  
            <circle cx="11.5" cy="11.5" r="11" stroke="white"/>  
            <path d="M7.64645 11.6464C7.45118 11.8417 7.45118 12.1583 7.64645 12.3536L10.8284 15.5355C11.0237 15.7308 11.3403 15.7308 11.5355 15.5355C11.7308 15.3403 11.7308 15.0237 11.5355 14.8284L8.70711 12L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L7.64645 11.6464ZM16 11.5L8 11.5V12.5L16 12.5V11.5Z" fill="white"/>  
          </svg>  
        </button>  
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>  
        {Array.from({ length: questions.length }).map((_, index) => (  
            <div   
              key={index}   
              style={{  
                width: '20px',   
                height: '20px',   
                borderRadius: '50%',   
                backgroundColor: step === index ? '#9141BF' : (answers[index] === null ? '#9141bf80' : (answers[index] === index ? '#9141BF' : '#9141BF')),  
                margin: '0 5px'  
              }}   
            />  
          ))}  
          </div>  
          <h2 style={{ marginTop: '20vh' }}>{question}</h2>  
          <p className='victor-desc'>{description}</p>  
          <div>  
            {options.map((option, index) => (  
              <button   
                key={index}   
                onClick={() => handleOptionClick(index)}   
                className='victor-otvet'   
                style={{  
                  backgroundColor: selectedOption === index ? '#9141bf' : '#9141bf80', // Изменяем фон на красный, если выбран  
                }}  
              >  
                {option}  
              </button>  
            ))}  
          </div>  
          <button   
            className='button'   
            onClick={handleNextClick}   
            disabled={selectedOption === null}   
            style={{ position: 'absolute', bottom: '2vh', right: '2vh', width: '120px' }}  
          >  
            OK  
          </button>  
        </div>  
      );  
    };  
    
    return <>{renderStep()}</>;  
  };  
    
  export default Test;  