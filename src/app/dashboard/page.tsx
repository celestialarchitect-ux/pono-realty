// ABOUTME: Legacy /dashboard route — permanently redirects to /profile, the real student home.
// ABOUTME: Original was a pre-Ralph-rebrand stub that read 'pono-user' from localStorage and rendered duplicate UI.

import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
  // Server-side redirect — old bookmarks + Footer links + middleware
  // PROTECTED_PREFIXES list still mention /dashboard, so the cleanest path
  // is to point every hit at /profile instead of deleting the route entirely.
  redirect('/profile');
}
