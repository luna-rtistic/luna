'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import i18next from '../i18n/client';

export default function LoginButton() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      if (!i18n.isInitialized) {
        await i18n.init();
      }
      setIsI18nInitialized(true);
    };
    initI18n();
  }, [i18n]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting Google login...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login response:', data);
    } catch (error: any) {
      console.error('Error during login:', error);
      setError(error.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging out:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isI18nInitialized) {
    return null; // i18n이 초기화되기 전까지는 아무것도 렌더링하지 않음
  }

  return (
    <div className="flex items-center gap-4">
      {error && (
        <div className="mb-2 p-2 bg-red-500/20 border border-red-500 rounded text-sm text-red-300">
          {error}
        </div>
      )}
      
      {user ? (
        <div className="flex items-center gap-8">
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif",
              fontWeight: 400,
              fontSize: '0.85rem',
              color: '#ccccdd',
              marginRight: '1.25rem',
            }}
          >
            {user.email}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            disabled={isLoading}
            style={{
              background: isLoading ? 'rgba(36,38,62,0.18)' : 'rgba(36,38,62,0.18)',
              color: isLoading ? '#a855f7' : '#a855f7',
              border: '1.5px solid rgba(168,85,247,0.18)',
              borderRadius: '12px',
              fontSize: '0.81rem',
              fontWeight: 500,
              padding: '0.3375em 0.825em',
              boxShadow: isLoading ? 'none' : 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
            }}
            onMouseOver={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(168,85,247,0.22)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 18px #a855f7'; }}}
            onMouseOut={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(36,38,62,0.18)'; e.currentTarget.style.color = '#a855f7'; e.currentTarget.style.boxShadow = 'none'; }}}
          >
            {isLoading ? t('logging_out') : t('logout')}
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            background: isLoading ? 'rgba(36,38,62,0.18)' : 'rgba(36,38,62,0.18)',
            color: isLoading ? '#a855f7' : '#a855f7',
            border: '1.5px solid rgba(168,85,247,0.18)',
            borderRadius: '12px',
            fontSize: '0.81rem',
            fontWeight: 500,
            padding: '0.3375em 0.825em',
            boxShadow: isLoading ? 'none' : 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
          }}
          onMouseOver={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(168,85,247,0.22)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 18px #a855f7'; }}}
          onMouseOut={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(36,38,62,0.18)'; e.currentTarget.style.color = '#a855f7'; e.currentTarget.style.boxShadow = 'none'; }}}
        >
          {isLoading ? t('logging_in') : t('login_with_google')}
        </motion.button>
      )}
    </div>
  );
} 