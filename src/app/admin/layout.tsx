import { TierGate } from '@/components/TierGate';
import { AdminEventBell } from '@/components/admin/AdminEventBell';
import { AdminNav } from '@/components/admin/AdminNav';

// Edge middleware blocks anonymous visitors at /admin. This layout adds the
// admin-role check — non-admin signed-in users get bounced back to /profile.
// AdminEventBell mounts the live signup + payment notifier (with mute toggle)
// across every admin page. AdminNav is the sticky top nav strip that
// replaces the old per-page bottom button row.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TierGate require="admin">
      <AdminEventBell />
      <AdminNav />
      {children}
    </TierGate>
  );
}
