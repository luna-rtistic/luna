'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LoginButton from './LoginButton';
import { useTranslation } from 'react-i18next';
import i18next from '../i18n/client';
import { useParams } from 'next/navigation';
import LanguageSwitch from './LanguageSwitch';
import AudioControl from './AudioControl';

const API_KEY = '8536b7ff5c028bdd2f4fa17f18675b4c'; // 임시로 직접 사용

const getWeatherIcon = (weatherCode: number) => {
  // OpenWeather weather condition codes
  if (weatherCode >= 200 && weatherCode < 300) return '⛈️'; // Thunderstorm
  if (weatherCode >= 300 && weatherCode < 400) return '🌧️'; // Drizzle
  if (weatherCode >= 500 && weatherCode < 600) return '🌧️'; // Rain
  if (weatherCode >= 600 && weatherCode < 700) return '❄️'; // Snow
  if (weatherCode >= 700 && weatherCode < 800) return '🌫️'; // Atmosphere (fog, mist, etc)
  if (weatherCode === 800) return '☀️'; // Clear sky
  if (weatherCode > 800) return '☁️'; // Clouds
  return '️'; // Default
};

export default function Header() {
  const params = useParams();
  const lng = params.lng as string;
  const { t } = useTranslation();
  const [weather, setWeather] = useState<{ temp: number; description: string; icon: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}&units=metric&lang=en`;
        console.log('Fetching weather from:', url); // 디버깅용

        const response = await axios.get(url);
        console.log('Weather response:', response.data); // 디버깅용

        if (!response.data || !response.data.main || !response.data.weather) {
          throw new Error('Invalid weather data format');
        }

        setWeather({
          temp: Math.round(response.data.main.temp),
          description: response.data.weather[0].description,
          icon: getWeatherIcon(response.data.weather[0].id)
        });
      } catch (error: any) {
        console.error('Failed to fetch weather:', error);
        if (error.response) {
          console.error('API response error:', error.response.data); // 디버깅용
          setError('Unable to load weather information');
        } else if (error.request) {
          console.error('Request error:', error.request); // 디버깅용
          setError('Failed to connect to server');
        } else {
          console.error('Error:', error.message); // 디버깅용
          setError('Unable to load weather information');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    const savedLang = typeof window !== 'undefined' && localStorage.getItem('lang');
    if (savedLang && i18next.language !== savedLang) {
      i18next.changeLanguage(savedLang);
    } else if (!savedLang) {
      i18next.changeLanguage(lng);
      localStorage.setItem('lang', lng);
    }
  }, [lng]);

  return (
    <header className="flex justify-between items-center p-4" style={{ backgroundColor: '#000000' }}>
      <div className="flex items-center">
        <LoginButton />
        {loading && <div className="text-white text-sm ml-4">Loading weather...</div>}
        {error && <div className="text-red-400 text-sm ml-4">{error}</div>}
        {weather && (
          <div className="text-white text-sm flex items-center gap-2 ml-4">
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif",
                fontWeight: 400,
                fontSize: '0.85rem',
                color: '#ccccdd'
              }}
            >
              {t('weather')}: {weather.temp}°C, {weather.description}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center flex-1">
        <AudioControl />
      </div>
      <div className="flex items-center">
        <LanguageSwitch />
      </div>
    </header>
  );
} 