import React from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
    return (
        <div className="faq-page">
            <h2>Часто задаваемые вопросы</h2>
            <div className="faq-item">
                <h3>Вопрос 1: Как пройти тест на знак зодиака?</h3>
                <p>Ответ: Для того чтобы пройти тест, перейдите в раздел "Профиль" и нажмите на кнопку "Пройти тест".</p>
            </div>
            <div className="faq-item">
                <h3>Вопрос 2: Как получить бонусы?</h3>
                <p>Ответ: Проходите ежедневные задания и получайте бонусы.</p>
            </div>
            <div className="faq-item">
                <h3>Вопрос 3: Как пригласить друга?</h3>
                <p>Ответ: Нажмите на ссылку "Пригласить друга" в профиле и отправьте приглашение.</p>
            </div>
            <Link to="/profile">
                <button>Назад в профиль</button>
            </Link>
        </div>
    );
};

export default FAQPage;
