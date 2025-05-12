import HomeContent from '../components/HomeContent';

interface PageProps {
  params: {
    lng: string;
  };
}

export default function Home({ params: { lng } }: PageProps) {
  return <HomeContent lng={lng} />;
} 