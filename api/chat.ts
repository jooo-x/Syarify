import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, context } = req.body;

  if (!question || !context) {
    return res.status(400).json({ error: 'Missing question or context' });
  }

  try {
    const message = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 250,
      messages: [
        {
          role: 'system',
          content: 'Jawab dalam bahasa Indonesia dan fokus pada konsep ekonomi syariah. Hindari fatwa dan jangan membuat klaim yang tidak didukung konteks.',
        },
        {
          role: 'user',
          content: `Kamu adalah asisten edukasi ekonomi syariah yang menjawab dalam bahasa Indonesia. Jawab dengan sederhana, jelas, dan akurat. Gunakan hanya konteks berikut sebagai sumber. Jika konteks tidak cukup, katakan bahwa informasi yang tersedia belum cukup.\n\nPertanyaan: ${question}\n\nKonteks:\n${context}`,
        },
      ],
    });

    return res.status(200).json({
      answer: message.choices[0].message.content,
    });
  } catch (error: any) {
    console.error('OpenAI error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response',
    });
  }
}
