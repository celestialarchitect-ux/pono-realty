// ABOUTME: Backfill accessExpiresAt for users who already have a paid tier
// ABOUTME: Standard=90d, Plus=180d, Solo=NULL. Computed from earliest Payment.

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1000;

const DURATION_DAYS = {
  standard: 90,
  plus: 180,
  // solo and free: no expiry
};

async function main() {
  const now = new Date();
  // Generous floor: any backfill expires no earlier than 60 days from today.
  // This protects early-adopter accounts whose payment.createdAt is in the
  // past — we don't want anyone losing access the moment this ships.
  const minimumFutureExpiry = new Date(now.getTime() + 60 * DAY_MS);

  const paid = await db.user.findMany({
    where: { tier: { in: ['standard', 'plus'] } },
    select: { id: true, email: true, tier: true, createdAt: true, accessExpiresAt: true },
  });

  console.log(`Found ${paid.length} users on standard/plus`);

  let updated = 0, skipped = 0, protected_ = 0;

  for (const u of paid) {
    if (u.accessExpiresAt && u.accessExpiresAt > now) {
      console.log(`  skip  ${u.email}  (${u.tier}, already has future expiry ${u.accessExpiresAt.toISOString()})`);
      skipped++;
      continue;
    }

    const days = DURATION_DAYS[u.tier];
    if (!days) {
      skipped++;
      continue;
    }

    // Use earliest succeeded payment as the anchor. If no payment row
    // (admin-granted tier), use the user's createdAt as the anchor.
    const earliestPayment = await db.payment.findFirst({
      where: { userId: u.id, tier: u.tier, status: 'succeeded' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const anchor = earliestPayment?.createdAt ?? u.createdAt;
    const computed = new Date(anchor.getTime() + days * DAY_MS);

    // Protect early users: if the computed expiry is already in the past or
    // less than 60 days away, extend to 60 days from today. Better to give
    // someone slightly extra than to revoke a real student's access on
    // rollout.
    const finalExpiry = computed < minimumFutureExpiry ? minimumFutureExpiry : computed;
    if (computed < minimumFutureExpiry) protected_++;

    await db.user.update({
      where: { id: u.id },
      data: { accessExpiresAt: finalExpiry },
    });
    console.log(`  set   ${u.email}  (${u.tier})  → ${finalExpiry.toISOString().slice(0,10)}  ${finalExpiry < computed ? '' : ''}${computed < minimumFutureExpiry ? '[PROTECTED]' : ''}`);
    updated++;
  }

  console.log(`\nDone. updated=${updated}  skipped=${skipped}  protected_from_premature_expiry=${protected_}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
