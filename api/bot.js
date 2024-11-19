const express = require('express');
const router = express.Router();

router.get('/api/config', (req, res) => {
    const apiKey = process.env.REACT_APP_CHATGPT_API_KEY; // Получаем ключ из переменной окружения
    res.json({ apiKey });
});

module.exports = router;