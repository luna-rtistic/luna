'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2.2rem;
  margin-top: 2.5rem;
`;

const FeedCard = styled.div`
  background: rgba(36, 38, 62, 0.55);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(168,85,247,0.18);
  border: 1.5px solid rgba(168,85,247,0.18);
  backdrop-filter: blur(16px) saturate(1.2);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  color: #f3f3fa;
  transition: box-shadow 0.3s, transform 0.2s;
  position: relative;
  overflow: hidden;
  &:hover {
    box-shadow: 0 12px 40px 0 rgba(168,85,247,0.22);
    transform: translateY(-2px) scale(1.03);
  }
`;

export default function ProphecyFeedPage() {
  const [prophecies, setProphecies] = useState<any[]>([]);
  const [comment, setComment] = useState<{[id: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState<{[id: string]: boolean}>({});
  const [userId, setUserId] = useState<string | null>(null);
  const urlParams = useParams();
  let lng = 'en';
  if (typeof window !== 'undefined' && localStorage.getItem('lang')) {
    lng = localStorage.getItem('lang')!;
  } else if (typeof urlParams?.lng === 'string') {
    lng = urlParams.lng;
  } else if (Array.isArray(urlParams?.lng)) {
    lng = urlParams.lng[0];
  }

  const fetchFeed = async () => {
    const { data: prophecies, error } = await supabase
      .from('prophecies')
      .select('*, reactions:reactions(type,user_id), comments:comments(id,content,user_id), image_url')
      .order('created_at', { ascending: false });
    if (!error && prophecies) setProphecies(prophecies);
  };

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    }
    fetchUser();
    fetchFeed();
  }, []);

  const handleReaction = async (prophecyId: string, reactionType: string) => {
    await supabase.from('prophecy_reactions').insert([
      { prophecy_id: prophecyId, reaction_type: reactionType }
    ]);
    fetchFeed();
  };

  const handleComment = async (e: React.FormEvent, prophecyId: string) => {
    e.preventDefault();
    if (!comment[prophecyId]) return;
    setIsSubmitting(prev => ({ ...prev, [prophecyId]: true }));
    await supabase.from('comments').insert([
      { prophecy_id: prophecyId, content: comment[prophecyId] }
    ]);
    setComment({ ...comment, [prophecyId]: '' });
    setIsSubmitting(prev => ({ ...prev, [prophecyId]: false }));
    fetchFeed();
  };

  const handleDelete = async (prophecyId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('prophecies').delete().eq('id', prophecyId).eq('user_id', userId);
    fetchFeed();
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100%',
          zIndex: -1,
          background: 'linear-gradient(180deg, #000 0%, #23244d 40%, #a855f7 100%)',
        }}
      />
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '2.5rem 1rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <h1 style={{ color: '#a855f7', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'Plus Jakarta Sans, Inter, Segoe UI, sans-serif' }}>
          Prophecy Feed
        </h1>
        <FeedGrid>
          {prophecies.length === 0 ? (
            <div style={{ color: '#fff', textAlign: 'center', fontSize: '1.3rem', gridColumn: '1/-1', marginTop: '3rem' }}>
              No prophecies found.<br />
              (Check your Supabase data or see the browser console for errors)
            </div>
          ) : (
            prophecies.map((p) => (
              <Link key={p.id} href={`/prophecies/${p.id}`} style={{ textDecoration: 'none' }}>
                <FeedCard>
                  {p.image_url && <img src={p.image_url} alt="prophecy" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: '1rem', marginBottom: '1rem', boxShadow: '0 0 12px #a855f7' }} />}
                  <div style={{ fontSize: '1.2rem', color: '#fff', textAlign: 'center', marginBottom: '0.4rem', fontWeight: 600 }}>{p.holy}</div>
                  <div style={{ color: '#a855f7', textAlign: 'center', fontSize: '1.08rem', marginBottom: '0.7rem' }}>{lng === 'ko' && p.meaning_ko ? p.meaning_ko : p.content}</div>
                  <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0 0.5rem 0' }}>
                    <button onClick={e => { e.preventDefault(); handleReaction(p.id, 'like'); }}><span>❤️</span> <span>{p.reactions?.filter((r:any)=>r.type==='like').length||0}</span></button>
                    <button onClick={e => { e.preventDefault(); handleReaction(p.id, 'laugh'); }}><span>😂</span> <span>{p.reactions?.filter((r:any)=>r.type==='laugh').length||0}</span></button>
                    <button onClick={e => { e.preventDefault(); handleReaction(p.id, 'cry'); }}><span>😢</span> <span>{p.reactions?.filter((r:any)=>r.type==='cry').length||0}</span></button>
                    <button onClick={e => { e.preventDefault(); handleReaction(p.id, 'thumbsup'); }}><span>👍</span> <span>{p.reactions?.filter((r:any)=>r.type==='thumbsup').length||0}</span></button>
                    {userId && p.user_id === userId && (
                      <button onClick={e => { e.preventDefault(); handleDelete(p.id); }}>Delete</button>
                    )}
                  </div>
                  <form onSubmit={e => handleComment(e, p.id)} style={{ marginTop: '0.7rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                      value={comment[p.id] || ''}
                      onChange={e => setComment({...comment, [p.id]: e.target.value})}
                      placeholder="Write a comment..."
                      disabled={isSubmitting[p.id]}
                      style={{ flex: 1, background: 'rgba(36,38,62,0.45)', border: '1.5px solid #a855f7', borderRadius: '0.7rem', color: '#fff', fontSize: '1rem', padding: '0.5rem 1rem' }}
                    />
                    <button type="submit" disabled={isSubmitting[p.id]} style={{ background: 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: '0.7rem', fontWeight: 600, fontSize: '1rem', padding: '0.5rem 1.2rem', boxShadow: '0 0 8px #a855f7', cursor: 'pointer' }}>Comment</button>
                  </form>
                </FeedCard>
              </Link>
            ))
          )}
        </FeedGrid>
      </div>
    </div>
  );
} 