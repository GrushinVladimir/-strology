const { useEffect, useState } = require('react');

export function useTelegram() {
    const tg = window.Telegram.WebApp;
    const [user, setUser] = useState(null);
    document.addEventListener('DOMContentLoaded', () => {
        // Устанавливаем высоту элемента body в соответствии с высотой viewport
        document.body.style.height = `${tg.viewHeight}px`;
        
        // Если нужно обновить размеры при изменении размера окна
        window.onresize = () => {
            document.body.style.height = `${tg.viewHeight}px`;
        };
    });
    useEffect(() => {
        console.log(tg.initDataUnsafe); // Логируем данные о пользователе
        if (tg.initDataUnsafe?.user) {
            setUser(tg.initDataUnsafe.user);
        }
    }, [tg]);

    const onClose = () => {
        tg.close();
    }

    const onToggleButton = () => {
        if (tg.MainButton.inVisible) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    }

    return {
        onClose,
        onToggleButton,
        tg,
        user,
    }
}