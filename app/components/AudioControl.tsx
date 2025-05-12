'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const ControlContainer = styled.div`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.25rem;
  z-index: 1000;
`;

const ControlButton = styled.button`
  background: rgba(36, 38, 62, 0.55);
  border: 1.5px solid rgba(168, 85, 247, 0.18);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px 0 rgba(60, 30, 90, 0.18);

  &:hover {
    background: rgba(168, 85, 247, 0.22);
    color: #fff;
    box-shadow: 0 12px 40px 0 rgba(168, 85, 247, 0.22);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default function AudioControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    const audio = new Audio();
    audio.src = '/audio/background.mp3';
    audio.loop = true;
    audioRef.current = audio;

    // Handle audio loading
    const handleCanPlay = () => {
      console.log('Audio can play');
      setIsLoading(false);
      setError(null);
      
      // Load saved state after audio is ready
      const savedState = localStorage.getItem('audioState');
      if (savedState) {
        const { isPlaying: savedIsPlaying, isMuted: savedIsMuted } = JSON.parse(savedState);
        setIsPlaying(savedIsPlaying);
        setIsMuted(savedIsMuted);
        if (savedIsPlaying) {
          audio.play().catch(err => {
            console.error('Error playing audio:', err);
            setError('Failed to play audio');
          });
        }
        if (savedIsMuted) {
          audio.muted = true;
        }
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio loading error:', e);
      setError('Failed to load audio');
      setIsLoading(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    // Start loading the audio
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      localStorage.setItem('audioState', JSON.stringify({
        isPlaying: !isPlaying,
        isMuted
      }));
    } catch (error) {
      console.error('Error toggling play:', error);
      setError('Failed to toggle play state');
    }
  };

  const toggleMute = () => {
    if (audioRef.current && !isLoading) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      localStorage.setItem('audioState', JSON.stringify({
        isPlaying,
        isMuted: !isMuted
      }));
    }
  };

  return (
    <ControlContainer>
      <ControlButton 
        onClick={togglePlay} 
        title={isPlaying ? 'Pause' : 'Play'}
        disabled={isLoading || !!error}
      >
        {isLoading ? <FaPlay /> : isPlaying ? <FaPause /> : <FaPlay />}
      </ControlButton>
      <ControlButton 
        onClick={toggleMute} 
        title={isMuted ? 'Unmute' : 'Mute'}
        disabled={isLoading || !!error}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </ControlButton>
    </ControlContainer>
  );
} 