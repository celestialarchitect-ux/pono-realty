// Edge middleware — auth-presence gate for protected routes.
//
// Anonymous visitors hitting /free, /profile, /course, /flashcards, /math,
// /glossary, /quizzes, /tutor, /practice, or /admin are bounced to /signup
// with ?next=<original-path>. Tier enforcement (free vs. paid) happens in
// <TierGate> on the client because edge runtime can't hit Prisma.
//
// Public marketing pages (/, /pricing, /tools, /example-website, etc.) and
// auth flows (/login, /signup, /forgot-password, /reset-password,
// /verify-email, /checkout/success) are NOT gated.

import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'rfs_session';

// Any path that starts with one of these prefixes requires a session cookie.
const PROTECTED_PREFIXES = [
  '/free',
  '/profile',
  '/dashboard',
  '/course',
  '/flashcards',
  '/math',
  '/glossary',
  '/quizzes',
  '/tutor',
  '/practice',
  '/admin',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const session = req.cookies.get(SESSION_COOKIE);
  if (session?.value) return NextResponse.next();

  // Route returning visitors to /login (they already have an account); the
  // login page links to /signup for first-time users. Previously this sent
  // them straight to /signup which made expired-session users think they
  // had to create a brand-new account.
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', pathname + search);
  return NextResponse.redirect(url);
}

// Skip Next.js internals, API routes (they handle their own auth), and static
// assets. Match everything else so the protected-prefix check runs.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.svg|manifest\\.json|opengraph-image|twitter-image|robots\\.txt|sitemap\\.xml|example-website|example-website-assets|design-review|verify-email|forgot-password|reset-password|checkout).*)',
  ],
};
