import { TierGate } from '@/components/TierGate';
import { AdminEventBell } from '@/components/admin/AdminEventBell';

// Edge middleware blocks anonymous visitors at /admin. This layout adds the
// admin-role check — non-admin signed-in users get bounced back to /profile.
// AdminEventBell mounts the live signup + payment notifier (with mute toggle)
// across every admin page.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TierGate require="admin">
      <AdminEventBell />
      {children}
    </TierGate>
  );
}
