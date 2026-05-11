// CLI: create-admin
//
// Usage:
//   railway run npm run create-admin -- you@email.com 'YourPassword123!' "First" "Last" [+18085551234]
//
// Idempotent: if a user with this email already exists, sets isAdmin=true
// and optionally rewrites the password with --reset-password.
//
// Email-verified by default — CLI-minted admins skip the email confirm step.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const args = process.argv.slice(2);
  const resetPassword = args.includes('--reset-password');
  const positional = args.filter(a => !a.startsWith('--'));
  const [email, password, firstName, lastName, phone] = positional;

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> <password> [firstName] [lastName] [phone] [--reset-password]');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('Password must be at least 10 characters.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Run via `railway run npm run create-admin -- …`');
    process.exit(1);
  }

  const db = new PrismaClient();
  const lower = email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email: lower } });

  if (existing) {
    const update: { isAdmin: boolean; passwordHash?: string; phone?: string | null } = { isAdmin: true };
    if (resetPassword) {
      update.passwordHash = await bcrypt.hash(password, 12);
    }
    if (phone) {
      update.phone = phone;
    }
    await db.user.update({ where: { email: lower }, data: update });
    console.log(`✓ Promoted ${lower} to admin${resetPassword ? ' (password reset)' : ' (password unchanged)'}${phone ? ' (phone updated)' : ''}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    const fn = (firstName?.trim() || lower.split('@')[0]) ?? '';
    const ln = lastName?.trim() || '';
    const composed = `${fn} ${ln}`.replace(/\s+/g, ' ').trim();
    const u = await db.user.create({
      data: {
        email: lower,
        passwordHash,
        firstName: fn,
        lastName: ln,
        name: composed,
        phone: phone || null,
        isAdmin: true,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`✓ Created admin ${u.email} (id: ${u.id})`);
  }

  await db.$disconnect();
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
