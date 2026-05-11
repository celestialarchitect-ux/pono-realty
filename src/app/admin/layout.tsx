import { TierGate } from '@/components/TierGate';

// Edge middleware blocks anonymous visitors at /admin. This layout adds the
// admin-role check — non-admin signed-in users get bounced back to /profile.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <TierGate require="admin">{children}</TierGate>;
}
