import { TierGate } from '@/components/TierGate';

// All routes inside src/app/(paid)/ are paid-tier-only. Edge middleware blocks
// anonymous visitors at the perimeter; TierGate adds the second wall that
// blocks signed-in but free-tier users and routes them to /pricing with the
// upgrade hint.
export default function PaidLayout({ children }: { children: React.ReactNode }) {
  return <TierGate require="paid">{children}</TierGate>;
}
