import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const categories = [
  { id: 'identity', emoji: '🧠', title_ko: '정체성', title_en: 'Identity' },
  { id: 'love', emoji: '❤️', title_ko: '애정운', title_en: 'Love & Relationships' },
  { id: 'career', emoji: '💼', title_ko: '직업운', title_en: 'Career' },
  { id: 'wealth', emoji: '💰', title_ko: '금전운', title_en: 'Wealth' },
];

export default function LandingPage({ lng }: { lng?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [name, setName] = useState('');
  const router = useRouter();
  const params = useParams();
  const lang = lng || (typeof params?.lng === 'string' ? params.lng : Array.isArray(params?.lng) ? params.lng[0] : 'en');

  const handleGenerate = () => {
    if (!selectedCategory || !name) return;
    router.push(`/${lang}/prophecies/new?name=${encodeURIComponent(name)}&category=${selectedCategory}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-2"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #23244d 40%, #a855f7 100%)',
      }}
    >
      <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: '60vh' }}>
        <h1
          className="glitch-text"
          style={{
            color: '#fff',
            fontFamily: "'Orbitron', 'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
            fontSize: '1.25rem',
            letterSpacing: '0.05em',
            textAlign: 'center',
            marginBottom: '2.5rem',
            textShadow: '2px 0 2px rgba(255,0,128,0.8), -2px 0 2px rgba(0,255,255,0.8), 0 2px 8px rgba(168,85,247,0.7)',
            animation: 'glitch-cyberpunk 1s infinite linear alternate-reverse'
          }}
        >
          {lang === 'ko' ? '알고리즘 예언을 받아보세요' : 'Receive Your Algorithmic Prophecy'}
        </h1>
        {/* Name Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === 'ko' ? '이름을 입력하세요' : 'Name'}
          className="neon-input"
          style={{
            marginBottom: '2rem',
            width: 400,
            minWidth: 400,
            height: 40,
            textAlign: 'center',
            fontSize: '1.1rem',
          }}
        />
        {/* Category Buttons */}
        <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-button${selectedCategory === category.id ? ' selected' : ''}`}
              style={{ marginBottom: '0.55rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', minWidth: 400, width: 400, height: 40, borderRadius: '2rem' }}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span style={{ fontSize: '1.25rem' }}>{category.emoji}</span>
              <span>{lang === 'ko' ? category.title_ko : category.title_en}</span>
            </button>
          ))}
        </div>
        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!selectedCategory || !name}
          className="mt-8 w-48 h-10 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:from-fuchsia-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span className="mr-2 text-xl">✨</span>
          {lang === 'ko' ? '확인' : 'Generate'}
        </button>
      </div>
    </main>
  );
} 