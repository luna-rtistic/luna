'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import styled from 'styled-components';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
};

type Prophecy = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user?: {
    email: string;
  };
  reactions: {
    like: number;
    laugh: number;
    cry: number;
    thumbsup: number;
  };
  holy: string;
};

const SoftGradientBackground = styled.main`
  min-height: 100vh;
  background: linear-gradient(180deg, #000 0%, #23244d 40%, #a855f7 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif;
  letter-spacing: 0.03em;
  line-height: 1.7;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    filter: blur(32px) brightness(1.1);
    opacity: 0.7;
    z-index: 0;
  }
`;

const GlassCard = styled.article`
  position: relative;
  z-index: 1;
  background: rgba(36, 38, 62, 0.55);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(60, 30, 90, 0.18);
  border: 1.5px solid rgba(168, 85, 247, 0.18);
  backdrop-filter: blur(16px) saturate(1.2);
  padding: 4.8rem 2.5rem 2.2rem 2.5rem;
  margin-bottom: 2.5rem;
  color: #f3f3fa;
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 12px 40px 0 rgba(168, 85, 247, 0.22);
  }
`;

const HolyCode = styled.div`
  font-size: 2.2rem;
  font-family: 'IBM Plex Mono', monospace;
  color: #fff;
  text-align: center;
  margin-top: 4rem;
  margin-bottom: 2.8rem;
  letter-spacing: 0.06em;
  line-height: 1.1;
  opacity: 0.92;
  text-shadow: 0 0 16px #a855f7, 0 0 6px #fff, 0 0 1px #a855f7;
  filter: blur(0.1px);
  font-weight: 500;
`;

const EnglishText = styled.div`
  font-size: 1.15rem;
  color: #a855f7;
  text-align: center;
  font-family: inherit;
  opacity: 0.88;
  margin-bottom: 0;
  letter-spacing: 0.07em;
  font-weight: 500;
`;

const ReactionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
`;

const ReactionButton = styled.button<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5em;
  background: ${({ selected }) => (selected ? 'rgba(168,85,247,0.18)' : 'rgba(36,38,62,0.18)')};
  border: 1.5px solid ${({ selected }) => (selected ? '#a855f7' : 'rgba(168,85,247,0.18)')};
  color: ${({ selected }) => (selected ? '#fff' : '#a855f7')};
  border-radius: 12px;
  padding: 0.3375em 0.825em;
  font-size: 0.81rem;
  font-family: inherit;
  font-weight: 500;
  box-shadow: ${({ selected }) => (selected ? '0 0 12px #a855f7' : 'none')};
  transition: all 0.22s cubic-bezier(.4,0,.2,1);
  cursor: pointer;
  outline: none;
  &:hover, &:focus {
    background: rgba(168,85,247,0.22);
    color: #fff;
    box-shadow: 0 0 18px #a855f7;
    transform: scale(1.06);
  }
  span {
    font-size: 0.9em;
    margin-right: 0.3em;
  }
`;

const CommentInputBox = styled.form`
  background: rgba(36, 38, 62, 0.45);
  border-radius: 1.1rem;
  box-shadow: 0 8px 32px 0 rgba(60, 30, 90, 0.18);
  border: 1.5px solid rgba(168, 85, 247, 0.18);
  padding: 1.7rem 1.2rem 1.2rem 1.2rem;
  margin-bottom: 2.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const CommentTextarea = styled.textarea`
  background: rgba(36, 38, 62, 0.55);
  border: 1.5px solid rgba(168, 85, 247, 0.18);
  border-radius: 1rem;
  color: #fff;
  font-family: inherit;
  font-size: 1.08rem;
  padding: 1rem;
  resize: vertical;
  min-height: 60px;
  box-shadow: 0 8px 32px 0 rgba(60, 30, 90, 0.18);
  letter-spacing: 0.04em;
  line-height: 1.7;
  transition: box-shadow 0.22s, border-color 0.22s, background 0.22s;
  &::placeholder {
    color: #e0cfff;
    opacity: 1;
    text-shadow: none;
  }
  &:focus {
    outline: none;
    border-color: #fff;
    box-shadow: 0 12px 40px 0 rgba(168, 85, 247, 0.22);
    background: rgba(168,85,247,0.08);
  }
`;

const CommentCard = styled.div`
  background: none;
  border-radius: 1rem;
  padding: 0.8rem 1rem;
  margin-bottom: 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 1rem;
  &:first-child {
    margin-top: 0.4rem;
  }
`;

const CommentContent = styled.p`
  font-size: 80%;
  line-height: 1.7;
  color: #ccccdd;
  margin: 0;
  font-family: inherit;
  letter-spacing: 0.01em;
  flex: 1;
`;

const CommentMetaBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 80%;
  color: #bbaaff;
  font-family: inherit;
  letter-spacing: 0.01em;
  white-space: nowrap;
`;

const CommentMetaLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 88%;
`;

const CommentDate = styled.span`
  font-style: italic;
  color: #bbaaff;
  font-size: 88%;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #a855f7;
  font-size: 90%;
  border-radius: 0.5em;
  padding: 0.2em 0.7em;
  cursor: pointer;
  opacity: 0.5;
  transition: color 0.2s, background 0.2s, opacity 0.2s, transform 0.18s;
  &:hover, &:focus {
    color: #fff;
    background: #6d28d9;
    opacity: 1;
    transform: scale(1.08);
  }
`;

const StyledButton = styled.button`
  background: linear-gradient(90deg, #a855f7 0%, #6366f1 100%);
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  font-family: inherit;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.7rem 1.5rem;
  box-shadow: 0 0 8px #a855f7;
  cursor: pointer;
  opacity: 1;
  transition: all 0.22s cubic-bezier(.4,0,.2,1);
  &:hover, &:focus {
    background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
    box-shadow: 0 0 24px #a855f7;
    transform: translateY(-2px) scale(1.04);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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

const CardImage = styled.img`
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 0 12px #a855f7;
`;

const Translation = styled.div`
  font-size: 1.2rem;
  font-family: 'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif !important;
  color: #a855f7;
  text-align: center;
  margin-top: 1.2rem;
  opacity: 0.88;
  letter-spacing: 0.07em;
  font-weight: 400;
  text-shadow: none;
`;

const CommentForm = styled.form`
  margin-top: 0.35rem;
  display: flex;
  gap: 0.5rem;
`;

const CommentInput = styled.input`
  flex: 1;
  background: rgba(36,38,62,0.45);
  border: 1.5px solid rgba(168,85,247,0.18);
  border-radius: 0.7rem;
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  &:focus {
    outline: none;
    border-color: #a855f7;
    background: rgba(168,85,247,0.08);
  }
`;

const CommentButton = styled.button`
  background: linear-gradient(90deg, #a855f7 0%, #6366f1 100%);
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  font-family: inherit;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.3rem 0.7rem;
  min-width: 2.2rem;
  min-height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px 0 rgba(60, 30, 90, 0.18);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.4,0,.2,1);
  &:hover, &:focus {
    background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
    box-shadow: 0 12px 40px 0 rgba(168, 85, 247, 0.22);
    transform: scale(1.04);
  }
`;

const FeedHolyCode = styled.div`
  font-size: 1.1rem;
  font-family: 'IBM Plex Mono', monospace;
  color: #fff;
  text-align: center;
  margin-top: 1.2rem;
  margin-bottom: 0.7rem;
  letter-spacing: 0.06em;
  text-shadow: 0 0 16px #a855f7, 0 0 6px #fff, 0 0 1px #a855f7;
  filter: blur(0.1px);
  opacity: 0.92;
  font-weight: 600;
`;

const FeedTranslation = styled.div`
  font-size: 0.85rem;
  color: #a855f7;
  text-align: center;
  margin-top: 0.4rem;
  opacity: 0.88;
  font-family: var(--font-space-grotesk), 'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif;
  letter-spacing: 0.07em;
  font-weight: 500;
  text-shadow: none;
`;

const FeedReactionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0 0.5rem 0;
  flex-wrap: wrap;
`;

export default function ProphecyDetailPage({ params }: { params: { id: string } }) {
  const [prophecy, setProphecy] = useState<Prophecy | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [allProphecies, setAllProphecies] = useState<any[]>([]);
  const [feedComment, setFeedComment] = useState<{[id: string]: string}>({});
  const [isFeedSubmitting, setIsFeedSubmitting] = useState<{[id: string]: boolean}>({});
  const urlParams = useParams();
  const initialLng = typeof urlParams?.lng === 'string'
    ? urlParams.lng
    : Array.isArray(urlParams?.lng)
      ? urlParams.lng[0]
      : 'en';
  const [lng, setLng] = useState(initialLng);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && savedLang !== lng) {
      setLng(savedLang);
    }
  }, []);

  useEffect(() => {
    fetchProphecy();
    fetchFeed();
  }, [params.id]);

  const fetchProphecy = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch prophecy with user info and reactions
      const { data: prophecyData, error: prophecyError } = await supabase
        .from('prophecies')
        .select(`
          *,
          reactions:reactions(type)
        `)
        .eq('id', params.id)
        .single();

      if (prophecyError) throw prophecyError;

      // Process reactions
      const processedProphecy = {
        ...prophecyData,
        reactions: {
          like: prophecyData.reactions.filter((r: any) => r.type === 'like').length,
          laugh: prophecyData.reactions.filter((r: any) => r.type === 'laugh').length,
          cry: prophecyData.reactions.filter((r: any) => r.type === 'cry').length,
          thumbsup: prophecyData.reactions.filter((r: any) => r.type === 'thumbsup').length,
        }
      };

      setProphecy(processedProphecy);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('prophecy_id', params.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData);

      // Fetch user's reactions
      if (user) {
        const { data: userReactionsData, error: userReactionsError } = await supabase
          .from('prophecy_reactions')
          .select('reaction_type')
          .eq('prophecy_id', params.id)
          .eq('user_id', user.id);

        if (userReactionsError) throw userReactionsError;

        setUserReactions(userReactionsData.map(r => r.reaction_type));
      }
    } catch (error) {
      console.error('Error fetching prophecy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to react');
      }

      // Check if user already has this reaction
      const existingReaction = userReactions.includes(reactionType);

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('prophecy_reactions')
          .delete()
          .match({
            prophecy_id: params.id,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('prophecy_reactions')
          .insert([
            {
              prophecy_id: params.id,
              user_id: user.id,
              reaction_type: reactionType
            }
          ]);

        if (error) throw error;
      }

      // Refresh prophecy
      fetchProphecy();
    } catch (error) {
      console.error('Error handling reaction:', error);
      alert('Failed to update reaction. Please try again.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to comment');

      const { error } = await supabase
        .from('comments')
        .insert([{
          content: newComment,
          prophecy_id: params.id,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email,
        }]);

      if (error) throw error;
      setNewComment('');
      fetchProphecy();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (type: 'prophecy' | 'comment', id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to delete');

      const { error } = await supabase
        .from(type === 'prophecy' ? 'prophecies' : 'comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      if (type === 'prophecy') router.push('/prophecies');
      else fetchProphecy();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const fetchFeed = async () => {
    const { data, error } = await supabase
      .from('prophecies')
      .select('*, reactions:reactions(type,user_id), comments:comments(id,content,user_id), image_url')
      .order('created_at', { ascending: false });
    if (!error && data) setAllProphecies(data);
  };

  const handleFeedReaction = async (prophecyId: string, reactionType: string) => {
    try {
      const { error } = await supabase
        .from('prophecy_reactions')
        .insert([{ prophecy_id: prophecyId, reaction_type: reactionType }]);
      if (error) throw error;
      fetchFeed();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleFeedComment = async (e: React.FormEvent, prophecyId: string) => {
    e.preventDefault();
    if (!feedComment[prophecyId]?.trim()) return;
    
    setIsFeedSubmitting(prev => ({ ...prev, [prophecyId]: true }));
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{ prophecy_id: prophecyId, content: feedComment[prophecyId] }]);
      if (error) throw error;
      setFeedComment(prev => ({ ...prev, [prophecyId]: '' }));
      fetchFeed();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsFeedSubmitting(prev => ({ ...prev, [prophecyId]: false }));
    }
  };

  if (isLoading) {
    return (
      <SoftGradientBackground>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">Loading prophecy...</div>
        </div>
      </SoftGradientBackground>
    );
  }

  if (!prophecy) {
    return (
      <SoftGradientBackground>
        <div className="max-w-4xl mx-auto">
          <div>Prophecy not found</div>
        </div>
      </SoftGradientBackground>
    );
  }

  return (
    <SoftGradientBackground>
      <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '2.5rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
          <Link
            href="/"
            style={{ color: '#a855f7', fontWeight: 500, fontFamily: 'inherit', fontSize: '1.1rem', letterSpacing: '0.04em', textDecoration: 'none', marginBottom: '2.2rem', display: 'inline-block' }}
          >
            ← Back
          </Link>
          <FeedCard>
            <HolyCode>
              {prophecy.holy}
              <Translation className="translation" style={{ fontFamily: 'Plus Jakarta Sans, Inter, Segoe UI, sans-serif !important' }}>{prophecy.content}</Translation>
            </HolyCode>
            <ReactionBar>
              <ReactionButton selected={userReactions.includes('like')} onClick={() => handleReaction('like')}>
                <span>❤️</span> <span>{prophecy.reactions.like}</span>
              </ReactionButton>
              <ReactionButton selected={userReactions.includes('laugh')} onClick={() => handleReaction('laugh')}>
                <span>😂</span> <span>{prophecy.reactions.laugh}</span>
              </ReactionButton>
              <ReactionButton selected={userReactions.includes('cry')} onClick={() => handleReaction('cry')}>
                <span>😢</span> <span>{prophecy.reactions.cry}</span>
              </ReactionButton>
              <ReactionButton selected={userReactions.includes('thumbsup')} onClick={() => handleReaction('thumbsup')}>
                <span>👍</span> <span>{prophecy.reactions.thumbsup}</span>
              </ReactionButton>
            </ReactionBar>
            <div style={{
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              position: 'absolute',
              top: '1.2rem',
              right: '1.5rem',
              textAlign: 'right',
            }}>
              <span>By {prophecy.user_name || 'Unknown'}</span>
              <span style={{ margin: '0 0.5em' }}>•</span>
              <span>{new Date(prophecy.created_at).toLocaleDateString()}</span>
            </div>
            <CommentForm onSubmit={handleCommentSubmit} style={{ marginTop: '1.2rem' }}>
              <CommentInput
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                placeholder="Write your comment..."
                disabled={isSubmitting}
              />
              <CommentButton type="submit" disabled={isSubmitting}>➤</CommentButton>
            </CommentForm>
            <div>
              {comments.map((comment) => (
                <CommentCard key={comment.id}>
                  <CommentContent>{comment.content}</CommentContent>
                  <CommentMetaBar>
                    <CommentMetaLeft>
                      <span>{comment.user_name || 'Unknown'}</span>
                      <CommentDate>{new Date(comment.created_at).toLocaleDateString()}</CommentDate>
                    </CommentMetaLeft>
                    {comment.user_id === prophecy.user_id && (
                      <DeleteButton onClick={() => handleDelete('comment', comment.id)}>
                        Delete
                      </DeleteButton>
                    )}
                  </CommentMetaBar>
                </CommentCard>
              ))}
            </div>
          </FeedCard>
        </div>
        <div style={{ maxWidth: 1200, margin: '3rem auto 0', padding: '2.5rem 1rem' }}>
          <FeedGrid>
            {allProphecies.map((p) => (
              <Link key={p.id} href={`/prophecies/${p.id}`} style={{ textDecoration: 'none' }}>
                <FeedCard>
                  {p.image_url && <CardImage src={p.image_url} alt="prophecy" />}
                  <FeedHolyCode>
                    {p.holy}
                    <FeedTranslation className="translation">{p.content}</FeedTranslation>
                  </FeedHolyCode>
                  <FeedReactionBar>
                    <ReactionButton style={{ transform: 'scale(0.8)', transformOrigin: 'left top', marginRight: '-1rem' }} onClick={e => { e.preventDefault(); handleFeedReaction(p.id, 'like'); }}><span>❤️</span> <span>{p.reactions?.filter((r:any)=>r.type==='like').length||0}</span></ReactionButton>
                    <ReactionButton style={{ transform: 'scale(0.8)', transformOrigin: 'left top', marginRight: '-1rem' }} onClick={e => { e.preventDefault(); handleFeedReaction(p.id, 'laugh'); }}><span>😂</span> <span>{p.reactions?.filter((r:any)=>r.type==='laugh').length||0}</span></ReactionButton>
                    <ReactionButton style={{ transform: 'scale(0.8)', transformOrigin: 'left top', marginRight: '-1rem' }} onClick={e => { e.preventDefault(); handleFeedReaction(p.id, 'cry'); }}><span>😢</span> <span>{p.reactions?.filter((r:any)=>r.type==='cry').length||0}</span></ReactionButton>
                    <ReactionButton style={{ transform: 'scale(0.8)', transformOrigin: 'left top' }} onClick={e => { e.preventDefault(); handleFeedReaction(p.id, 'thumbsup'); }}><span>👍</span> <span>{p.reactions?.filter((r:any)=>r.type==='thumbsup').length||0}</span></ReactionButton>
                  </FeedReactionBar>
                  <div style={{ color: '#bbaaff', fontSize: '0.7rem', margin: '0.2rem 0 -0.15rem 0' }}>
                    Comments: {p.comments?.length ?? 0}
                  </div>
                </FeedCard>
              </Link>
            ))}
          </FeedGrid>
        </div>
      </div>
    </SoftGradientBackground>
  );
} 