// CLI: create-admin
//
// Usage:
//   railway run npm run create-admin -- you@email.com 'YourPassword123!' "Your Name"
//
// Idempotent: if a user already exists with that email, this script sets
// isAdmin=true and (optionally) rewrites the password if --reset-password
// is passed. Use this once to bootstrap the first admin without going through
// the signup form.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const args = process.argv.slice(2);
  const resetPassword = args.includes('--reset-password');
  const positional = args.filter(a => !a.startsWith('--'));
  const [email, password, name] = positional;

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> <password> [name] [--reset-password]');
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
    const update: { isAdmin: boolean; passwordHash?: string } = { isAdmin: true };
    if (resetPassword) {
      update.passwordHash = await bcrypt.hash(password, 12);
    }
    await db.user.update({ where: { email: lower }, data: update });
    console.log(`✓ Promoted ${lower} to admin${resetPassword ? ' (password reset)' : ' (password unchanged)'}`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    const u = await db.user.create({
      data: {
        email: lower,
        passwordHash,
        name: name?.trim() || lower.split('@')[0],
        isAdmin: true,
        emailVerifiedAt: new Date(), // CLI-created admins skip email verification
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
