import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fallbackLng, languages } from './app/i18n/settings';

export function middleware(request: NextRequest) {
  // 현재 요청된 pathname 가져오기
  const pathname = request.nextUrl.pathname;

  // 공개 파일 및 API 경로는 무시
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 현재 locale 확인
  const pathnameIsMissingLocale = languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    // Always redirect to English
    return NextResponse.redirect(
      new URL(`/en${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 