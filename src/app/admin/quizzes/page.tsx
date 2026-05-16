// ABOUTME: Compat redirect. The old quiz analytics page was merged into /admin/questions at launch.
// ABOUTME: Keeps bookmarks and link targets working without a 404.

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function QuizzesRedirect() {
  redirect('/admin/questions');
}
