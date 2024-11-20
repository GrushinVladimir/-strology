const express = require('express');  
const TestResult = require('../models/TestResult');  
const router = express.Router();  





router.get('/:telegramId', async (req, res) => {  
    try {  
        const results = await TestResult.find({ userId: req.params.telegramId });  
        res.json(results);  
    } catch (error) {  
        console.error('Ошибка при получении результатов теста:', error);  
        res.status(500).json({ message: 'Ошибка сервера' });  
    }  
 }); 