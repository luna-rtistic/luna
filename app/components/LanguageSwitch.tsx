'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function LanguageSwitch() {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const currentLang = pathname.startsWith('/ko') ? 'ko' : 'en';

  // 최초 진입 시 영어로 리다이렉트
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('lang');
      if (!storedLang && !pathname.startsWith('/ko')) {
        if (!pathname.startsWith('/en')) {
          router.replace('/en');
        }
        localStorage.setItem('lang', 'en');
      }
    }
  }, [pathname, router]);

  const handleSwitch = (lang: string) => {
    if (lang === currentLang) return;
    const newPath = pathname.replace(/^\/(en|ko)/, `/${lang}`);
    router.push(newPath);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleSwitch('en')}
        aria-label="Switch to English"
        style={{ fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        🇺🇸
      </button>
      <button
        onClick={() => handleSwitch('ko')}
        aria-label="Switch to Korean"
        style={{ fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        🇰🇷
      </button>
    </div>
  );
} 