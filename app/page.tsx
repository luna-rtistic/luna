'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !/^\/(en|ko)(\/|$)/.test(pathname)) {
      router.replace('/en');
    }
  }, [pathname, router]);

  return null;
}
