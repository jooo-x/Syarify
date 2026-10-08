import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Send, Sparkles, BookOpen, ArrowRight, Loader2, BookMarked } from 'lucide-react';
import { useModuls, useIstilah, getSumberLabel } from '@/hooks/useMateri';
import { useRouter } from '@/context/RouterContext';

interface SearchResult {
  type: 'istilah' | 'materi';
  label: string;
  text: string;
  slug?: string;
  materiIndex?: number;
  sumberLabel?: string;
  score: number;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  results?: SearchResult[];
}

const quickQuestions = [
  'Apa bedanya mudharabah dan musyarakah?',
  'Kenapa pinjol ilegal berbahaya?',
  'Apa itu inklusi keuangan?',
  'Apa itu rahn?',
  'Apa itu maqashid syariah?',
  'Bagaimana cara zakat penghasilan?',
];

const stopwords = new Set([
  'apa', 'itu', 'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'dengan', 'untuk',
  'pada', 'adalah', 'akan', 'bisa', 'dapat', 'saya', 'kamu', 'kami', 'mereka',
  'ini', 'tersebut', 'sebuah', 'juga', 'tidak', 'iya', 'ya',
  'bagaimana', 'jelaskan', 'sebutkan', 'siapa', 'kapan', 'mana', 'kenapa',
  'mengapa', 'beda', 'bedanya', 'perbedaan', 'sama', 'seperti', 'tentang',
  'apakah', 'boleh', 'halal', 'haram', 'jika', 'kalau', 'bila', 'agar',
  'supaya', 'karena', 'sebab', 'oleh', 'para', 'sang', 'si', 'sangat',
  'lebih', 'paling', 'coba', 'tolong', 'mohon', 'ingin', 'tahu', 'cara',
]);

const synonyms: Record<string, string> = {
  'bunga': 'riba',
  'judi': 'maysir',
  'taruhan': 'maysir',
  'titipan': 'wadiah',
  'sewa': 'ijarah',
  'gadai': 'rahn',
  'pinjol': 'p2p lending riba',
  'pinjaman online': 'p2p lending riba',
  'patungan': 'musyarakah crowdfunding',
  'sedekah': 'infak',
  'sukuk': 'sbsn',
  'bagi untung': 'nisbah mudharabah',
};

function normalizeQuery(q: string): string {
  let text = q.toLowerCase().trim();
  text = text.replace(/[''`]/g, '');
  for (const [key, val] of Object.entries(synonyms)) {
    if (text.includes(key)) {
      text = text.replace(key, val);
    }
  }
  return text;
}

function extractKeywords(query: string): string[] {
  const normalized = normalizeQuery(query);
  const words = normalized.split(/\s+/).filter(Boolean);
  const keywords = words.filter((w) => w.length > 1 && !stopwords.has(w));
  return keywords.length > 0 ? keywords : words.filter((w) => w.length > 1);
}

function buildAiContext(results: SearchResult[]): string {
  return results
    .slice(0, 4)
    .map((result) => {
      const kind = result.type === 'istilah' ? 'Istilah' : 'Materi';
      return `- ${kind}: ${result.label}\n${result.text}`;
    })
    .join('\n\n');
}

function getAiProvider(): 'openai' | 'gemini' | null {
  const provider = (import.meta.env.VITE_AI_PROVIDER ?? '').toLowerCase();
  const hasOpenAI = Boolean(import.meta.env.VITE_OPENAI_API_KEY);
  const hasGemini = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  if (provider === 'gemini' && hasGemini) return 'gemini';
  if (provider === 'openai' && hasOpenAI) return 'openai';
  if (hasOpenAI) return 'openai';
  if (hasGemini) return 'gemini';
  return null;
}

async function generateAiReply(question: string, contextResults: SearchResult[]): Promise<string | null> {
  const provider = getAiProvider();
  if (!provider) return null;

  const context = buildAiContext(contextResults);
  const prompt = `Kamu adalah asisten edukasi ekonomi syariah yang menjawab dalam bahasa Indonesia. Jawab dengan sederhana, jelas, dan akurat. Gunakan hanya konteks berikut sebagai sumber. Jika konteks tidak cukup, katakan bahwa informasi yang tersedia belum cukup.

Pertanyaan: ${question}

Konteks:
${context}`;

  if (provider === 'openai') {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
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
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    } catch {
      return null;
    }
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 250,
          },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('')
      .trim();

    return text || null;
  } catch {
    return null;
  }
}

export function TanyaAIPage() {
  const { navigate } = useRouter();
  const { data: moduls, loading: modulLoading } = useModuls();
  const { data: istilah, loading: istilahLoading } = useIstilah();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loading = modulLoading || istilahLoading;

  const searchIndex = useMemo(() => {
    const istilahEntries = istilah.map((ist) => ({
      istilah: ist.istilah,
      arab: ist.arab ?? '',
      arti: ist.arti,
      contoh: ist.contoh ?? '',
      modulSlug: ist.modul_slug ?? '',
      sumberId: ist.sumber_id ?? '',
      text: `${ist.istilah} ${ist.arab ?? ''} ${ist.arti} ${ist.contoh ?? ''}`.toLowerCase(),
    }));

    const materiEntries: Array<{
      judul: string; isi: string; slug: string; materiIndex: number;
      halamanBuku: string; sumberId: string; text: string;
    }> = [];

    for (const modul of moduls) {
      for (let mi = 0; mi < modul.materi.length; mi++) {
        const mat = modul.materi[mi];
        materiEntries.push({
          judul: mat.judul,
          isi: mat.isi,
          slug: modul.slug,
          materiIndex: mi,
          halamanBuku: mat.halaman_buku ?? '',
          sumberId: mat.sumber_id ?? '',
          text: `${mat.judul} ${mat.isi}`.toLowerCase(),
        });
      }
    }

    return { istilahEntries, materiEntries };
  }, [moduls, istilah]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  function search(query: string): ChatMessage {
    const keywords = extractKeywords(query);
    if (keywords.length === 0) {
      return { role: 'ai', text: 'Coba ketik pertanyaan yang lebih spesifik ya — misal "apa itu riba?" atau "jelaskan mudharabah".' };
    }

    const results: SearchResult[] = [];

    for (const e of searchIndex.istilahEntries) {
      let score = 0;
      for (const kw of keywords) {
        if (e.istilah.toLowerCase() === kw) score += 10;
        else if (e.istilah.toLowerCase().includes(kw)) score += 4;
        if (e.text.includes(kw)) score += 1;
      }
      if (score > 0) {
        results.push({
          type: 'istilah',
          label: e.istilah,
          text: e.arti,
          score,
          sumberLabel: getSumberLabel(e.sumberId || null),
        });
      }
    }

    for (const e of searchIndex.materiEntries) {
      let score = 0;
      for (const kw of keywords) {
        if (e.judul.toLowerCase().includes(kw)) score += 3;
        if (e.text.includes(kw)) score += 1;
      }
      if (score > 0) {
        results.push({
          type: 'materi',
          label: e.judul,
          text: e.isi.length > 200 ? e.isi.slice(0, 200) + '...' : e.isi,
          slug: e.slug,
          materiIndex: e.materiIndex,
          score,
          sumberLabel: getSumberLabel(e.sumberId || null),
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, 4);

    if (top.length === 0) {
      const popularIstilah = ['Riba', 'Mudharabah', 'Murabahah'];
      return {
        role: 'ai',
        text: `Belum ketemu di materi. Coba tanyakan istilah lain seperti: ${popularIstilah.join(', ')}.`,
      };
    }

    let answer = '';
    if (top[0].type === 'istilah') {
      const ist = searchIndex.istilahEntries.find((e) => e.istilah === top[0].label);
      if (ist) {
        answer = `${ist.istilah}`;
        if (ist.arab) answer += ` (${ist.arab})`;
        answer += ` — ${ist.arti}`;
      }
    } else {
      const mat = searchIndex.materiEntries.find((e) => e.judul === top[0].label);
      if (mat) {
        const sentences = mat.isi.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
        answer = sentences;
      }
    }

    return { role: 'ai', text: answer, results: top };
  }

  function handleSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q || thinking) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      void (async () => {
        const localReply = search(q);
        let reply = localReply;

        if (localReply.results && localReply.results.length > 0) {
          const aiText = await generateAiReply(q, localReply.results);
          if (aiText) {
            reply = { ...localReply, text: aiText };
          }
        }

        setMessages((prev) => [...prev, reply]);
        setThinking(false);
      })();
    }, 300 + Math.random() * 400);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)] animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Pencari Materi</h1>
        <p className="text-sm text-gray-500">Tanya apa saja tentang ekonomi syariah — dijawab dari materi dan kamus yang tersedia.</p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl2 bg-white border border-primary-100 shadow-soft p-4 mb-3 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-card">
                <Search className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent-300 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary-800" aria-hidden="true" />
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Ketik pertanyaanmu atau pilih salah satu di bawah. Jawaban diambil dari materi aplikasi, bukan fatwa.
            </p>
          </div>
        )}

        {loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" aria-hidden="true" />
            <p className="text-xs text-gray-400 mt-2">Menyiapkan data...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl2 px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-primary-50/80 text-ink rounded-bl-md'
              }`}
            >
              {msg.role === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Search className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                  <span className="text-xs font-semibold text-primary-600">Pencari Materi</span>
                </div>
              )}
              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.results && msg.results.length > 0 && (
                <div className="mt-3 pt-2 border-t border-primary-100 space-y-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sumber rujukan</p>
                  {msg.results.map((src, si) => (
                    <div key={si} className="bg-white rounded-lg px-3 py-2 border border-primary-100">
                      <div className="flex items-center gap-2">
                        {src.type === 'istilah' ? (
                          <BookMarked className="w-3.5 h-3.5 text-accent-500 shrink-0" aria-hidden="true" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-primary-500 shrink-0" aria-hidden="true" />
                        )}
                        <span className="text-xs text-primary-600 font-medium truncate flex-1">{src.label}</span>
                        {src.sumberLabel && (
                          <span className="text-[9px] text-gray-400 shrink-0">{src.sumberLabel}</span>
                        )}
                      </div>

                      {src.type === 'materi' && src.slug && (
                        <button
                          onClick={() => navigate({ name: 'materi', slug: src.slug!, materiIndex: src.materiIndex ?? 0 })}
                          className="mt-1.5 w-full flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors"
                        >
                          Baca selengkapnya
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-primary-50/80 rounded-xl2 rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                <span className="text-xs font-semibold text-primary-600">Pencari Materi</span>
              </div>
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {messages.length === 0 && !loading && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="inline-flex items-center gap-1 bg-primary-50 text-primary-600 text-xs font-medium px-3 py-2 rounded-full hover:bg-primary-100 transition-colors min-h-[36px]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaanmu di sini..."
          disabled={loading}
          className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-white border border-primary-100 text-sm text-ink placeholder:text-gray-400 focus:border-primary-400 transition-colors min-h-[44px] shadow-soft"
          aria-label="Kotak pertanyaan"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-700 transition-colors"
          aria-label="Kirim pertanyaan"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
