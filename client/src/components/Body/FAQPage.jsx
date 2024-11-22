import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
    const [openQuestion, setOpenQuestion] = useState(null);

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
        <div className="faq-page">
            <h2>Часто задаваемые вопросы</h2>
            {questions.map((item, index) => (
                <div key={index} className="faq-item">
                    <h3 onClick={() => toggleQuestion(index)}>
                        {item.question}
                    </h3>
                    {openQuestion === index && <p>{item.answer}</p>}
                </div>
            ))}
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