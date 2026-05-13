import { policyStyles as s } from '@/lib/policies-style';

export const metadata = {
  title: 'Privacy Policy — Ralph Foulger\'s Academy of Real Estate',
  description: 'What we collect, how we use it, who we share it with, and how to delete it.',
};

export default function PrivacyPage() {
  return (
    <article>
      <div style={s.eyebrow}>Privacy Policy</div>
      <h1 style={s.h1}>What we collect, why, and how to delete it.</h1>
      <p style={s.intro}>
        We&rsquo;re a small Hawaii pre-license course. We collect the minimum information needed to run your enrollment, and we don&rsquo;t sell your data. This page explains the specifics.
      </p>

      <h2 style={s.h2}>1. What we collect</h2>
      <p style={s.p}>
        When you sign up or use the platform, we collect:
      </p>
      <ul style={s.ul}>
        <li style={s.li}><strong style={s.strong}>Account info:</strong> first name, last name, email, optional phone number, hashed password (bcrypt — we never see your plaintext password).</li>
        <li style={s.li}><strong style={s.strong}>Study activity:</strong> chapters read, quizzes attempted, individual question answers, time spent per page, your study planner goal date.</li>
        <li style={s.li}><strong style={s.strong}>Payment data:</strong> Stripe Customer ID and a record of each successful charge (amount, currency, tier, timestamp, Stripe session ID). We do <strong style={s.strong}>not</strong> see or store your card number or CVC &mdash; that all lives at Stripe.</li>
        <li style={s.li}><strong style={s.strong}>Communications:</strong> emails we send you (verify, password reset, welcome, support replies) and emails you send into our support inbox.</li>
        <li style={s.li}><strong style={s.strong}>Optional &lsquo;app PIN&rsquo;:</strong> a SHA-256 hash of your 4-digit PIN, stored locally on your device only. Not sent to our servers.</li>
      </ul>
      <p style={s.p}>
        We do not run third-party trackers (Google Analytics, Meta Pixel, etc.). The only telemetry on the platform is our own server-side aggregation of study hours and quiz attempts, used to power your profile dashboard and the admin analytics view.
      </p>

      <h2 style={s.h2}>2. Why we collect it</h2>
      <ul style={s.ul}>
        <li style={s.li}>To run your enrollment: track the state-required 60 study hours, save your quiz scores, render your composite grade.</li>
        <li style={s.li}>To process payments: identify you to Stripe so receipts land in your inbox and refunds return to your card.</li>
        <li style={s.li}>To communicate: verify your email so password resets are possible, answer support tickets, send your course-completion certificate.</li>
        <li style={s.li}>To improve the course: per-question analytics tell us which exam concepts trip students up &mdash; we use that to revise question wording. The analytics are aggregated; we don&rsquo;t single out an individual student&rsquo;s wrong answer in product decisions.</li>
      </ul>

      <h2 style={s.h2}>3. Who we share it with</h2>
      <p style={s.p}>
        We share strictly the minimum needed to operate:
      </p>
      <ul style={s.ul}>
        <li style={s.li}><strong style={s.strong}>Stripe</strong> &mdash; payment processing. Stripe is PCI-DSS compliant. Their privacy policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener" style={{ color: '#14837b', textDecoration: 'underline' }}>stripe.com/privacy</a>.</li>
        <li style={s.li}><strong style={s.strong}>Resend</strong> &mdash; transactional email delivery (verify links, receipts, password resets). Their privacy policy: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener" style={{ color: '#14837b', textDecoration: 'underline' }}>resend.com/legal/privacy-policy</a>.</li>
        <li style={s.li}><strong style={s.strong}>Anthropic</strong> &mdash; powers the AI Real Estate Tutor. Your tutor conversation is sent to Anthropic for response generation. Anthropic does not train on API data by default. Their policy: <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener" style={{ color: '#14837b', textDecoration: 'underline' }}>anthropic.com/legal/privacy</a>.</li>
        <li style={s.li}><strong style={s.strong}>Railway</strong> &mdash; our hosting provider. Stores our database and serves the application. Their policy: <a href="https://railway.com/legal/privacy" target="_blank" rel="noopener" style={{ color: '#14837b', textDecoration: 'underline' }}>railway.com/legal/privacy</a>.</li>
      </ul>
      <p style={s.p}>
        <strong style={s.strong}>We don&rsquo;t sell your data.</strong> We don&rsquo;t share it with advertisers or data brokers. We disclose only when legally compelled by a valid subpoena, and we&rsquo;ll notify you if we&rsquo;re permitted to.
      </p>

      <h2 style={s.h2}>4. How long we keep it</h2>
      <ul style={s.ul}>
        <li style={s.li}>Active accounts: indefinitely while you&rsquo;re enrolled.</li>
        <li style={s.li}>After deletion: study records, plan, quiz history, support messages, in-app email logs are removed within 24 hours. Stripe receipts are retained on Stripe&rsquo;s side per our financial-records obligation but are no longer linked to your account in our system.</li>
      </ul>

      <h2 style={s.h2}>5. How to delete your data</h2>
      <p style={s.p}>
        Open your <strong style={s.strong}>profile page</strong> → scroll to the &ldquo;Delete my account&rdquo; card → re-enter your password and type <code style={{ background: '#ece2cc', padding: '2px 6px', borderRadius: 4 }}>delete</code> to confirm. The deletion is immediate and complete; we don&rsquo;t hold accounts in a &ldquo;soft-deleted&rdquo; bucket.
      </p>
      <p style={s.p}>
        If you can&rsquo;t log in but want your account removed, email <a href="mailto:support@ralphfoulger.com" style={{ color: '#14837b', textDecoration: 'underline' }}>support@ralphfoulger.com</a> from the address on file with a description of the account; we&rsquo;ll verify and process the deletion manually.
      </p>

      <h2 style={s.h2}>6. Children</h2>
      <p style={s.p}>
        The Academy is for adults pursuing a Hawaii real estate license. We do not knowingly collect information from anyone under 18. If you believe a minor has signed up, email us and we&rsquo;ll remove the account.
      </p>

      <h2 style={s.h2}>7. Your rights</h2>
      <p style={s.p}>
        You can request a copy of the data we hold about you, ask us to correct anything inaccurate, or ask us to delete it (see Section 5). Email <a href="mailto:support@ralphfoulger.com" style={{ color: '#14837b', textDecoration: 'underline' }}>support@ralphfoulger.com</a> for any of these.
      </p>

      <h2 style={s.h2}>8. Security</h2>
      <p style={s.p}>
        Passwords are bcrypt-hashed with 12 rounds. Sessions use httpOnly, secure, sameSite=&ldquo;lax&rdquo; cookies. All data in transit is HTTPS. We don&rsquo;t store payment card data; Stripe handles that. We audit dependencies regularly and rotate secrets when needed.
      </p>

      <div style={s.effective}>
        Effective 2026-05-13 · Questions: <a href="mailto:support@ralphfoulger.com" style={{ color: '#14837b' }}>support@ralphfoulger.com</a>
      </div>
    </article>
  );
}
