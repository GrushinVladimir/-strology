import { Link, useNavigate } from 'react-router-dom';  
import React, { useEffect, useState } from 'react';  
import axios from 'axios';  
import { useTelegram } from '../hooks/useTelegram';   
import './Body.css';  

const ProfilePage = ({ telegramId }) => {  
    const { user, tg } = useTelegram();  
    const [userData, setUserData] = useState(null);  
    const [zodiacSign, setZodiacSign] = useState(null);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const [testCompleted, setTestCompleted] = useState(false);  
    const [showSupportModal, setShowSupportModal] = useState(false);  
    const navigate = useNavigate();  
    const [isPaid, setIsPaid] = useState(false); // Состояние для отслеживания статуса оплаты  

    const fetchUserData = async () => {  
        try {  
            const response = await axios.get(`/api/users/${telegramId}`);  
            if (response.data && response.data.user) {  
                setUserData(response.data.user);  
                setZodiacSign(response.data.user.zodiacSign);  
            } else {  
                setError('Данные пользователя не найдены');  
            }  
        } catch (err) {  
            setError('Ошибка при получении данных пользователя');  
        } finally {  
            fetchTestResults();  
            fetchPaymentStatus(); // Проверка статуса оплаты  
        }  
    };  

    const fetchTestResults = async () => {  
        try {  
            const response = await axios.get(`/api/test-results/${telegramId}`);  
            setTestCompleted(response.data && response.data.length > 0);  
        } catch (err) {  
            setTestCompleted(false);  
        } finally {  
            setLoading(false); // Завершение загрузки  
        }  
    };  

    const fetchPaymentStatus = async () => { // Новая функция для проверки статуса оплаты  
        try {  
            const response = await axios.get(`/api/payment/${telegramId}`);  
            setIsPaid(response.data.paid); // Устанавливаем состояние на основе ответа  
        } catch (error) {  
            console.error('Ошибка при проверке статуса платежа:', error);  
            setIsPaid(false); // Если произошла ошибка, считаем, что оплата не прошла  
        }  
    };  

    useEffect(() => {  
        if (!telegramId) return;  
        fetchUserData(); // Инициализируем получение данных пользователя  
    }, [telegramId]);  

    const getAvatarUrl = (user) => {  
        return user && user.photo_url ? user.photo_url : 'https://via.placeholder.com/100';  
    };  

    if (loading) return <p>Загрузка...</p>; // Индикатор загрузки  
    if (error) return <p>{error}</p>; // Сообщение об ошибке  

    const handleInviteClick = () => {  
        const inviteLink = 'https://t.me/mygoroskopbot_lite_new_bot'; // Ссылка на ваш бот в Telegram  
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=Пригласите своего друга в наше астрологическое приложение!`;  

        window.open(shareUrl, '_blank');  
    };  

    const handleSupportClick = () => {  
        setShowSupportModal(true); // Показываем модальное окно  
    };  

    const closeModal = () => {  
        setShowSupportModal(false); // Закрываем модальное окно  
    };  
    
    const handleDeleteProfile = async () => {  
        console.log(`Удаление профиля с telegramId: ${telegramId}`);  
         // Убедитесь в том, что пользователь действительно хочет удалить профиль  
         if (window.confirm("Вы уверены, что хотите удалить свой профиль?")) {  
            try {  
                await axios.delete(`/api/users/${telegramId}`);  
                // Если удаление прошло успешно, перенаправите пользователя на главную страницу или страницу приветствия  
                navigate('/main');  
            } catch (error) {  
                console.error("Не удалось удалить профиль:", error);  
                alert("Произошла ошибка при попытке удалить профиль.");  
            }  
        }  
    };  

    return (  
        <div className="profile-page">  
            <div className="profile-header">  
                <img src={getAvatarUrl(userData)} alt="Аватар пользователя" />  
                <h1>{userData ? userData.name : "Пользователь"}</h1>  
                <p>{zodiacSign && `Ваш знак Зодиака: ${zodiacSign}`}</p>  

                {/* Проверка статуса оплаты */}  
                {isPaid ? (  
                    <p style={{ color: 'green' }}>Статус: Оплачено</p>  
                ) : (  
                    <Link to="/payment">  
                        <button className='button na'>  
                            Оплатить подписку  
                        </button>  
                    </Link>  
                )}  

                {testCompleted ? (  
                    <p style={{ color: 'green' }}>Тест выполнен!</p>  
                ) : (  
                    <Link to="/test">  
                        <button className='button na' style={{  
                            position: 'absolute', margin: '2vh auto auto', display: 'block',  
                            left: 'unset', transform: 'none', padding: '6px 15px',  
                            bottom: '10px', transform: 'translateX(-50%)', left: '50%',  
                            width: '115px', fontSize: '15px'  
                        }}>  
                            Летс гоу  
                        </button>  
                    </Link>  
                )}  
            </div>  

            <div className="bottom-profile">  
                <div>  
                    <Link to="/faq" style={{ textDecoration: 'auto' }}>  
                        <p style={{ cursor: 'pointer' }}>Часто задаваемые вопросы</p>  
                    </Link>  
                </div>  
                <div>  
                    <p onClick={handleInviteClick} style={{ cursor: 'pointer' }}>Пригласить друга</p>  
                </div>  
                <div>  
                    <p onClick={handleSupportClick} style={{ cursor: 'pointer' }}>Поддержка</p>  
                </div>  
                <div>  
                    <p onClick={handleDeleteProfile} style={{ cursor: 'pointer', color: 'red' }}>  
                        Удалить профиль  
                    </p>  
                </div>  
            </div>  

            {/* Модальное окно для поддержки */}  
            {showSupportModal && (  
                <div className="modal">  
                    <div className="modal-content">  
                        <span className="close" onClick={closeModal}>&times;</span>  
                        <h2>Контакты поддержки</h2>  
                        <p>Email: support@example.com</p>  
                        <p>Телефон: +123456789</p>  
                    </div>  
                </div>  
            )}  

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

export default ProfilePage;  