import type { Metadata } from "next";
import { Space_Grotesk, Orbitron, Unica_One, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "../globals.css";
import Header from "../components/Header";
import AudioControl from '../components/AudioControl';
import { languages } from '../i18n/settings';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
});

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-orbitron',
});

const unicaOne = Unica_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: '--font-plus-jakarta-sans' });

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: "Algorithmic Prophecy",
  description: "Receive your algorithmic prophecy from the digital oracle",
};

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default function Layout({
  children,
  params: { lng }
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <div lang={lng}>
      {children}
    </div>
  );
} 