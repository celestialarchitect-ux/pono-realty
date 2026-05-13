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
      {/* Desktop: sidebar grows the row, content fills the rest.
          Mobile: sidebar becomes a sticky top strip via media-driven
          variant inside <AdminNav />, so flex on the wrapper still works. */}
      <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: '100vh' }}>
        <AdminNav />
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </TierGate>
  );
}
