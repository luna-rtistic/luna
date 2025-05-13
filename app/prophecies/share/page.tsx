'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRef, useState, Suspense } from 'react';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabase';

// Separate client component for useSearchParams
function ShareProphecyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const holy = searchParams?.get('holy');
  const english = searchParams?.get('english');
  const name = searchParams?.get('name');
  const category = searchParams?.get('category');
  const [comment, setComment] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!holy || !english || !name || !category) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div>Prophecy not found</div>
      </main>
    );
  }

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      // 카드 캡쳐
      const canvas = await html2canvas(cardRef.current);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create image');
      // Storage 업로드
      const fileName = `prophecy_${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('prophecy-images')
        .upload(fileName, blob, { contentType: 'image/png' });
      if (uploadError) throw uploadError;
      // 공개 URL 획득
      const { data: publicUrlData } = supabase
        .storage
        .from('prophecy-images')
        .getPublicUrl(fileName);
      const imageUrl = publicUrlData?.publicUrl;
      // Feed insert
      const { error: feedError } = await supabase
        .from('feed')
        .insert([
          {
            image_url: imageUrl,
            user_name: name,
            comment,
            category,
            created_at: new Date().toISOString(),
          }
        ]);
      if (feedError) throw feedError;
      // Feed 페이지로 이동 (예: /feed)
      router.push('/feed');
    } catch (e) {
      alert('공유에 실패했습니다.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div ref={cardRef} className="mb-8 px-8 py-6 border-2 border-purple-500 rounded-xl bg-black/70 shadow-lg max-w-xl w-full text-center">
        <div className="text-purple-400 text-xl mb-4">Dear {name},</div>
        <div className="text-3xl font-mono mb-2">{holy}</div>
        <div className="text-lg text-purple-300 font-mono">{english}</div>
      </div>
      <input
        className="mb-4 px-4 py-2 rounded bg-black border border-purple-500 text-white w-full max-w-xl placeholder-gray-400"
        placeholder="코멘트를 남겨보세요!"
        value={comment}
        onChange={e => setComment(e.target.value)}
        disabled={isSharing}
      />
      <button
        className="px-6 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-sm font-mono neon-shadow transition-all duration-200 disabled:opacity-50"
        onClick={handleShare}
        disabled={isSharing}
      >
        {isSharing ? '공유 중...' : '공유하기'}
      </button>
    </main>
  );
}

export default function ShareProphecyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareProphecyContent />
    </Suspense>
  );
} 