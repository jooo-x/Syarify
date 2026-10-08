import { GoogleGenAI } from '@google/genai';

// Inisialisasi Gemini menggunakan API Key dari lingkungan Vercel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, context } = req.body;

    // Menyusun prompt gabungan dokumen Supabase ekonomi syariah dan input user
    const fullPrompt = `Kamu adalah asisten edukasi ekonomi syariah yang menjawab dalam bahasa Indonesia. Jawab dengan sederhana, jelas, dan akurat.\n\nKonieks Dokumen:\n${context || ''}\n\nPertanyaan Pengguna: ${question}`;

    // Memanggil model cerdas Gemini 2.5 Flash yang sangat cepat
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    // Mengembalikan format respons agar sama seperti yang dibaca oleh halaman frontend Anda
    return res.status(200).json({ 
      choices: [{ message: { content: response.text } }] 
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
