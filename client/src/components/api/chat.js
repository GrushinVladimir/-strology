import axios from 'axios';
import dotenv from 'dotenv';

// Загрузите переменные окружения из .env файла
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Метод не разрешен' });
    return;
  }

  const { message, topic } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Тема: ${topic}.` },
          { role: 'user', content: message },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: process.env.OPENAI_API_KEY, // Получите API-ключ из переменной окружения
        },
      }
    );

    res.status(200).json({ reply: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Ошибка при обращении к ChatGPT API:', error);
    res.status(500).json({ reply: 'Произошла ошибка. Попробуйте снова.' });
  }
}
