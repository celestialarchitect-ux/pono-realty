// ABOUTME: Emergency password reset / account inspect. Runs INSIDE Railway via `railway run`.
// ABOUTME: Usage:  railway run --service ralph-realty node scripts/admin-recover.mjs <command> [args]

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();
const [, , cmd, ...rest] = process.argv;

async function main() {
  if (!cmd) {
    console.error('usage:');
    console.error('  list <fragment>            find users whose email/name contains the fragment');
    console.error('  reset <email> <newpw>      set a known password for the user (also verifies email)');
    console.error('  unlock <email>             clear lockouts / mark email verified');
    process.exit(1);
  }

  if (cmd === 'list') {
    const frag = (rest[0] ?? '').toLowerCase();
    const users = await db.user.findMany({
      where: frag ? {
        OR: [
          { email: { contains: frag, mode: 'insensitive' } },
          { name:  { contains: frag, mode: 'insensitive' } },
          { firstName: { contains: frag, mode: 'insensitive' } },
        ],
      } : undefined,
      select: { id: true, email: true, name: true, tier: true, isAdmin: true, emailVerifiedAt: true, createdAt: true, lastSeenAt: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    console.log(`Found ${users.length} user(s):`);
    for (const u of users) {
      console.log(
        ` • ${u.email.padEnd(38)} ${u.name.padEnd(24)} tier=${u.tier.padEnd(10)} admin=${u.isAdmin ? 'Y' : 'N'} verified=${u.emailVerifiedAt ? 'Y' : 'N'} id=${u.id}`,
      );
    }
    return;
  }

  if (cmd === 'reset') {
    const [emailRaw, newPwRaw] = rest;
    if (!emailRaw || !newPwRaw) { console.error('need email + newpw'); process.exit(1); }
    const email = emailRaw.trim().toLowerCase();
    if (newPwRaw.length < 8) { console.error('password must be ≥8 chars'); process.exit(1); }
    const user = await db.user.findUnique({ where: { email } });
    if (!user) { console.error(`No user with email ${email}`); process.exit(1); }
    const hash = await bcrypt.hash(newPwRaw, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
    });
    console.log(`✓ Password reset for ${email} (id=${user.id}). New password length: ${newPwRaw.length}`);
    console.log('  emailVerifiedAt:', user.emailVerifiedAt ? 'already verified' : 'set to now');
    return;
  }

  if (cmd === 'unlock') {
    const email = (rest[0] ?? '').trim().toLowerCase();
    if (!email) { console.error('need email'); process.exit(1); }
    const user = await db.user.findUnique({ where: { email } });
    if (!user) { console.error(`No user with email ${email}`); process.exit(1); }
    await db.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
    });
    console.log(`✓ ${email} unlocked. (In-memory rate limit clears on next container restart.)`);
    return;
  }

  console.error(`unknown command: ${cmd}`);
  process.exit(1);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
