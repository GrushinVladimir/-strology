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
        }  
    };  

    const fetchTestResults = async () => {  
        try {  
            const response = await axios.get(`/api/test-results/${telegramId}`);  
            setTestCompleted(response.data && response.data.length > 0);  
        } catch (err) {  
            setTestCompleted(false);  
        } finally {  
            setLoading(false);  
        }  
    };  

    useEffect(() => {  
        if (!telegramId) return;  
        fetchUserData();  
    }, [telegramId]);  

    const getAvatarUrl = (user) => {  
        return user && user.photo_url ? user.photo_url : 'https://via.placeholder.com/100';  
    };  

    if (loading) return <p>Загрузка...</p>;  
    if (error) return <p>{error}</p>;  

    const handleInviteClick = () => {  
        const inviteLink = 'https://t.me/mygoroskopbot_lite_new_bot';   
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=Пригласите своего друга в наше астрологическое приложение!`;  
        window.open(shareUrl, '_blank');  
    };  

    const handleSupportClick = () => {  
        setShowSupportModal(true);   
    };  

    const closeModal = () => {  
        setShowSupportModal(false);   
    };  

    const handleDeleteProfile = async () => {  
        console.log(`Удаление профиля с telegramId: ${telegramId}`);  
        if (!telegramId) {  
            alert('telegramId недоступен. Проверьте состояние пользователя.');  
            return;  
        }  
        const confirmDelete = window.confirm("Вы уверены, что хотите удалить свой профиль?");  
        if (confirmDelete) {  
            try {  
                const response = await fetch(`/api/users/${telegramId}`, {  
                    method: 'DELETE',  
                    headers: {  
                        'Content-Type': 'application/json',  
                    },  
                });  
                if (response.ok) {  
                    console.log('Профиль успешно удален!');  
                    alert("Профиль успешно удален!");  
                    navigate('/');  
                } else {  
                    const errorData = await response.json();  
                    alert("Ошибка при удалении профиля: " + errorData.message);  
                }  
            } catch (error) {  
                console.error('Ошибка:', error);
                alert("Ошибка при удалении профиля. Пожалуйста, попробуйте еще раз.");  
            }  
        }  
    };  

    const startPayment = () => {  
        // Здесь вам нужно указать URL и параметры для вашего платежного API  
        const paymentData = {  
            amount: 100, // Сумма платежа в копейках, если валюта в рублях  
            currency: 'RUB', // Или другая валюта  
            description: 'Оплата за услуги',  
            payload: {  
                userId: telegramId,  
                // Другие данные, необходимые для вашей системы  
            },  
        };  

        // Используйте нужный метод вызова API для выполнения платежа  
        fetch('https://api.yourpaymentprovider.com/pay', {  
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json',  
                'Authorization': `Bearer ${YOUR_API_TOKEN}`, // Токен API, если требуется  
            },  
            body: JSON.stringify(paymentData),  
        })  
            .then(response => {  
                if (!response.ok) {  
                    throw new Error('Ошибка при выполнении платежа');  
                }  
                return response.json();  
            })  
            .then(data => {  
                console.log('Платеж успешен!', data);  
                alert('Платеж успешно завершен!');  
                // Дополнительные действия после успешной оплаты  
            })  
            .catch(error => {  
                console.error('Ошибка:', error);  
                alert('Произошла ошибка при оплате. Пожалуйста, попробуйте еще раз.');  
            });  
    };  

    return (  
        <div className="profile-page">  
            <div className="top-profile">  
                <div className="top-profile-left">  
                    <img src={getAvatarUrl(user)} alt="Avatar" />  
                    <h1>{userData ? userData.name : 'Имя пользователя'}</h1>  
                </div>  
                <div className="top-profile-right active" onClick={startPayment}>  
                    Оплатить  
                </div>  
            </div>  
<<<<<<< HEAD
            <div className="middle-profile">  
                {/* Ваши другие элементы профиля */}  
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
=======

            {/* Модальное окно для поддержки */}
            {showSupportModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Контакты поддержки</h2>
                        <p style={{fontSize: '1rem',opacity: .7}}>Email: support@example.com</p>
                        <p style={{fontSize: '1rem',opacity: .7}}>Телефон: +123456789</p>
                    </div>
                </div>
            )}

>>>>>>> 9fbadbbb91c23671ba6b40bedd14111bd2714698
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