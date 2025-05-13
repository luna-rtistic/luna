'use client';

import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import styled from 'styled-components';
import { PROPHECIES } from '@/lib/propheciesData';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FaVolumeUp } from 'react-icons/fa';

type Category = 'identity' | 'love' | 'career' | 'wealth';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  z-index: 10;
  margin-top: 14vh;
`;

const BackgroundElements = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #000 0%, #23244d 40%, #a855f7 100%);
  z-index: 0;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    /* 문양 제거 */
  }
`;

const NeonCard = styled(motion.div)`
  background: rgba(30, 27, 60, 0.7);
  border-radius: 1.2rem;
  box-shadow: 0 0 8px #a855f7, 0 0 1px #fff, 0 0 0.5px #6366f1;
  border: 1.5px solid #a855f7;
  padding: 1.25rem 1rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  transition: all 0.3s ease;
  min-height: 120px;
  &:hover {
    box-shadow: 0 0 16px #a855f7, 0 0 2px #fff, 0 0 1px #6366f1;
    transform: translateY(-4px) scale(1.02);
  }
`;

const ProphecyText = styled.div`
  font-size: 2.5rem;
  font-family: 'IBM Plex Mono', monospace;
  color: #fff;
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: 0.04em;
  position: relative;
  min-height: 3.5em;
  cursor: pointer;
`;

const HolyText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  transition: opacity 0.3s;
  opacity: 1;
  text-shadow: 0 0 40px #a855f7, 0 0 20px #fff, 0 0 10px #a855f7;
  filter: blur(0.1px);
  ${ProphecyText}:hover & {
    opacity: 0;
  }
`;

const Translation = styled.div`
  font-size: 1.32rem;
  font-family: inherit;
  color: #a855f7;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  letter-spacing: 0.01em;
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  ${ProphecyText}:hover & {
    opacity: 1;
  }
`;

const BibleVerse = styled.div`
  font-size: 0.85rem;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  color: #b3b3ff;
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
  opacity: 0.8;
  line-height: 1.4;
  padding: 0 1rem;
`;

const NeonButton = styled(motion.button)`
  background: transparent;
  color: #fff;
  border: 1.5px solid #a855f7;
  border-radius: 0.7rem;
  padding: 0.525rem 1.125rem;
  font-family: 'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  box-shadow: 0 0 8px #a855f7;
  cursor: pointer;
  margin-top: 2rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(168, 85, 247, 0.1);
    box-shadow: 0 0 24px #a855f7;
    border-color: #fff;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #a855f7;
  }
`;

const Dear = styled.div`
  text-align: center;
  font-size: 1.3rem;
  color: #a855f7;
  font-family: 'Orbitron', monospace;
  margin-bottom: 1rem;
  text-shadow: 0 0 8px #a855f7;
`;

const StyledMain = styled.main`
  min-height: 100vh;
  background: linear-gradient(180deg, #000 0%, #23244d 40%, #a855f7 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
`;

const TTSButton = styled.button`
  background: none;
  border: none;
  color: #a855f7;
  font-size: 1.5rem;
  margin-left: 0.5rem;
  cursor: pointer;
  vertical-align: middle;
  transition: color 0.2s;
  &:hover:enabled {
    color: #fff;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Separate client component for useSearchParams
function NewProphecyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lng = typeof params?.lng === 'string' ? params.lng : Array.isArray(params?.lng) ? params.lng[0] : 'en';
  const name = searchParams?.get('name') || '';
  const category = searchParams?.get('category') as Category;
  const [prophecy, setProphecy] = useState<{ code: string; meaning: string; meaning_ko: string; bible?: string } | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);

  useEffect(() => {
    if (category && PROPHECIES[category]) {
      const arr = PROPHECIES[category];
      const random = arr[Math.floor(Math.random() * arr.length)];
      setProphecy(random);
    }
  }, [category]);

  useEffect(() => {
    // Add loader animation
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    if (!document.getElementById('tts-loader-style')) {
      style.id = 'tts-loader-style';
      document.head.appendChild(style);
    }
    return () => {
      const styleElement = document.getElementById('tts-loader-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  async function handleTTS(text: string) {
    setTtsLoading(true);
    try {
      console.log('Sending TTS request for text:', text);
      
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error('TTS API error:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        });
        throw new Error(errorData?.error || errorData?.details || `TTS failed (${res.status})`);
      }

      const contentType = res.headers.get('content-type');
      console.log('Received content type:', contentType);

      if (!contentType?.includes('audio/')) {
        const errorText = await res.text();
        console.error('Unexpected response type:', {
          contentType,
          response: errorText
        });
        throw new Error('Invalid response from TTS service');
      }

      const blob = await res.blob();
      console.log('Received blob size:', blob.size);

      if (blob.size === 0) {
        throw new Error('Received empty audio response');
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        throw new Error('Failed to play audio');
      };

      try {
        await audio.play();
      } catch (e) {
        console.error('Audio play error:', e);
        throw new Error('Failed to play audio: ' + (e instanceof Error ? e.message : String(e)));
      }

      audio.onended = () => {
        console.log('Audio playback completed');
        URL.revokeObjectURL(url);
      };
    } catch (e: any) {
      console.error('TTS Error:', e);
      alert(e.message || 'Failed to play voice. Please try again.');
    } finally {
      setTtsLoading(false);
    }
  }

  const handleNext = async () => {
    if (!prophecy) return;
    // 로그인 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    // Insert prophecy into Supabase
    const { data: prophecyData, error } = await supabase
      .from('prophecies')
      .insert({
        content: prophecy.meaning,
        meaning_ko: prophecy.meaning_ko,
        holy: prophecy.code,
        category,
        user_name: user.user_metadata?.full_name || 'Anonymous',
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prophecy:', error);
      return;
    }
    router.push(`/prophecies/${prophecyData.id}`);
  };

  if (!category || !name) {
    return (
      <main style={{ minHeight: '100vh', background: '#0f0c29', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Missing name or category. Please go back and try again.</div>
      </main>
    );
  }

  return (
    <StyledMain>
      <BackgroundElements />
      <Container>
        <Dear>Dear {name},</Dear>
        <NeonCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {prophecy && (
            <ProphecyText>
              <HolyText>
                {prophecy.code}
              </HolyText>
              <Translation>
                {lng === 'ko' && prophecy.meaning_ko ? prophecy.meaning_ko : prophecy.meaning}
                <TTSButton
                  aria-label="Play TTS"
                  onClick={() => handleTTS(lng === 'ko' && prophecy.meaning_ko ? prophecy.meaning_ko : prophecy.meaning)}
                  disabled={ttsLoading}
                  title={lng === 'ko' ? '한글 해석 음성' : 'Play English interpretation'}
                  style={{ marginLeft: 8 }}
                >
                  {ttsLoading ? (
                    <span className="loader" style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid #a855f7', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }} />
                  ) : (
                    <FaVolumeUp />
                  )}
                </TTSButton>
              </Translation>
            </ProphecyText>
          )}
          {prophecy?.bible && <BibleVerse>{prophecy.bible}</BibleVerse>}
        </NeonCard>
        <NeonButton
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
        >
          Next
        </NeonButton>
      </Container>
    </StyledMain>
  );
}

export default function NewProphecyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewProphecyContent />
    </Suspense>
  );
} 