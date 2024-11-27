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
                                    <path d="M11.6464 7.64645C11.8417 7.45118 12.1583 7.45118 12.3536 7.64645L14.8284 10.8284C15.0237 11.0237 15.0237 11.3403 14.8284 11.5355C14.6331 11.7308 14.3166 11.7308 14.1213 11.5355L12 9.17157L9.87868 11.5355C9.68343 11.7308 9.36683 11.7308 9.17157 11.5355C8.97631 11.3403 8.97631 11.0237 9.17157 10.8284L11.6464 8.70711ZM11.5 16L11.5 8L12.5 8L12.5 16L11.5 16Z" fill="white"/>  
                                </svg>  

                            ) : (  
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" className='arows'>  
                            <path d="M7.64645 11.6464C7.45118 11.8417 7.45118 12.1583 7.64645 12.3536L10.8284 15.5355C11.0237 15.7308 11.3403 15.7308 11.5355 15.5355C11.7308 15.3403 11.7308 15.0237 11.5355 14.8284L14.8284 12L11.5355 8.70711C11.3403 8.51179 11.3403 8.19527 11.5355 8L14.8284 11.6464L11.6464 14.8284C11.4512 15.0237 11.4512 15.3403 11.6464 15.5355C11.8417 15.7308 12.1583 15.7308 12.3536 15.5355L15.5355 12.3536C15.7308 12.1583 15.7308 11.8417 15.5355 11.6464L12 9.17157L14.8284 12C15.0237 12.1953 15.0237 12.5118 14.8284 12.7071C14.6331 12.9024 14.3166 12.9024 14.1213 12.7071L11.6464 10.8284C11.4512 10.6322 11.4512 10.3157 11.6464 10.1213L14.8284 7.64645C15.0237 7.45118 15.3403 7.45118 15.5355 7.64645C15.7308 7.84172 15.7308 8.1583 15.5355 8.35355L12 11L14.8284 9.17157C15.0237 8.97631 15.0237 8.65973 14.8284 8.46447L11.6464 11.6464Z" fill="white"/>  
                        </svg>   

                            )}  
                        </p>  
                        {openQuestion === index && <span>{item.answer}</span>}  
                    </div>  
                ))}  
            </div>  
            <div className="menu">  
                <Link to="/main">  
                    <img src="img/menu/Union.png" alt="Главная" />  
                    <span>Главная</span>  
                </Link>  
                <Link to="/chat">  
                    <img src="img/menu/chat.png" alt="Чат" />  
                    <span>Чат</span>  
                </Link>  
                <Link to="/profile">  
                    <img src="img/menu/profile.png" style={{ width: '13px' }} alt="Профиль" />  
                    <span>Профиль</span>  
                </Link>  
            </div>   
        </div>   
    );  
};  

export default FAQPage;  