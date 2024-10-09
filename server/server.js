// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/yourdbname', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Создание схемы
const userSchema = new mongoose.Schema({
    username: String,
    day: Number,
    month: Number,
    year: Number,
    placeOfBirth: String,
    zodiacSign: String,
});

const User = mongoose.model('User', userSchema);

// Маршрут для сохранения данных
app.post('/api/saveUser', async (req, res) => {
    try {
        const userData = req.body;
        const newUser = new User(userData);
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
