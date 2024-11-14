import axios from 'axios';

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
          Authorization: `Bearer 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`, // Здесь укажите ваш API-ключ
        },
      }
    );

    res.status(200).json({ reply: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Ошибка при обращении к ChatGPT API:', error);
    res.status(500).json({ reply: 'Произошла ошибка. Попробуйте снова.' });
  }
}