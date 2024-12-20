import React, { useState } from 'react';  
import { Link, useNavigate } from 'react-router-dom';  

const FAQPage = () => {  
    const [openQuestion, setOpenQuestion] = useState(null);  
    const navigate = useNavigate();  

    const questions = [  
        {  
            question: "Как пройти тест на знак зодиака?",  
            answer: "Для того чтобы пройти тест, перейдите в раздел 'Профиль' и нажмите на кнопку 'Пройти тест'."  
        },  
        {  
            question: "Как получить бонусы?",  
            answer: "Проходите ежедневные задания и получайте бонусы."  
        },  
        {  
            question: "Как пригласить друга?",  
            answer: "Нажмите на ссылку 'Пригласить друга' в профиле и отправьте приглашение."  
        }  
    ];  

    const toggleQuestion = (index) => {  
        setOpenQuestion(openQuestion === index ? null : index);  
    };  

    return (  
        <div className='faq-body'>  
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer'}} className='body-test'>  
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">  
                    <circle cx="11.5" cy="11.5" r="11" stroke="white"/>  
                    <path d="M7.64645 11.6464C7.45118 11.8417 7.45118 12.1583 7.64645 12.3536L10.8284 15.5355C11.0237 15.7308 11.3403 15.7308 11.5355 15.5355C11.7308 15.3403 11.7308 15.0237 11.5355 14.8284L8.70711 12L11.5355 9.17157C11.7308 8.97631 11.7308 8.65973 11.5355 8.46447C11.3403 8.2692 11.0237 8.2692 10.8284 8.46447L7.64645 11.6464ZM16 11.5L8 11.5V12.5L16 12.5V11.5Z" fill="white"/>  
                </svg>  
            </button>   
            <div className="faq-page">  
                <h2>Часто задаваемые вопросы</h2>  
                {questions.map((item, index) => (  
                    <div key={index} className="faq-item">  
                        <p onClick={() => toggleQuestion(index)} style={{ cursor: 'pointer',    position: 'relative '}}>  
                            {item.question}  
                            {openQuestion === index ? ( 
                                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" className='arows'>  
                                    <path d="M11.6464 7.64645C11.8417 7.45118 12.1583 7.45118 12.3536 7.64645L15.5355 10.8284C15.7308 11.0237 15.7308 11.3403 15.5355 11.5355C15.3403 11.7308 15.0237 11.7308 14.8284 11.5355L12 8.70711L9.17157 11.5355C8.97631 11.7308 8.65973 11.7308 8.46447 11.5355C8.2692 11.3403 8.2692 11.0237 8.46447 10.8284L11.6464 7.64645ZM11.5 16L11.5 8L12.5 8L12.5 16L11.5 16Z" fill="white"/>  
                                </svg>  

                            ) : (  
<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" className='arows'>  
    <path d="M11.6464 15.3536C11.8417 15.5488 12.1583 15.5488 12.3536 15.3536L15.5355 12.1716C15.7308 11.9763 15.7308 11.6597 15.5355 11.4645C15.3403 11.2692 15.0237 11.2692 14.8284 11.4645L12 14.2929L9.17157 11.4645C8.97631 11.2692 8.65973 11.2692 8.46447 11.4645C8.2692 11.6597 8.2692 11.9763 8.46447 12.1716L11.6464 15.3536ZM11.5 8L11.5 16L12.5 16L12.5 8L11.5 8Z" fill="white"/>  
</svg>  

                            )}  
                        </p>  
                        {openQuestion === index && <span>{item.answer}</span>}  
                    </div>  
                ))}  
            </div>  
            <div className="menu">
          <Link to="/main">
          <img src="home.png" alt="Главная" className='ico-home' />  
            <span >Главная</span>
          </Link>
          <Link to="/chat">
          <img src="chat.png" alt="Чат"  className='ico-chat'/>  
            <span>Чат</span>
          </Link>
          <Link>
          <img src="user.png" alt="Профиль" className='ico-profile' style={{opacity: '1'}}/> 
        <span style={{opacity: '1'}}>Профиль</span>
      </Link>
        </div>
        </div>   
    );  
};  

export default FAQPage;  