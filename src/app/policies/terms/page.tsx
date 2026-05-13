import { policyStyles as s } from '@/lib/policies-style';

export const metadata = {
  title: 'Terms of Service — Ralph Foulger\'s Academy of Real Estate',
  description: 'Terms governing use of the Ralph Foulger Academy of Real Estate online pre-license platform.',
};

export default function TermsPage() {
  return (
    <article>
      <div style={s.eyebrow}>Terms of Service</div>
      <h1 style={s.h1}>The rules of using the Academy.</h1>
      <p style={s.intro}>
        These terms apply when you create an account, enroll in a course, or use any feature of <strong style={s.strong}>Ralph Foulger&rsquo;s Academy of Real Estate</strong> (the &ldquo;Academy&rdquo;). By signing up you agree to them.
      </p>

      <h2 style={s.h2}>1. Who we are</h2>
      <p style={s.p}>
        Ralph Foulger&rsquo;s Academy of Real Estate is an approved Hawaii Real Estate Commission (REC) pre-license course provider. The Academy is operated by Ralph S. Foulger, Realtor, in partnership with online services that run this platform.
      </p>

      <h2 style={s.h2}>2. What you&rsquo;re buying</h2>
      <p style={s.p}>
        Three products are sold:
      </p>
      <ul style={s.ul}>
        <li style={s.li}><strong style={s.strong}>Standard ($599)</strong> &mdash; full 20-chapter Hawaii pre-license course, audiobook, AI tutor, mocks, daily lesson planner. <strong style={s.strong}>3 months</strong> of course access from enrollment.</li>
        <li style={s.li}><strong style={s.strong}>Plus ($899)</strong> &mdash; everything in Standard + a custom Hawaii agent website built for you upon passing the PSI exam. <strong style={s.strong}>6 months</strong> of course access + access to a one-time <strong style={s.strong}>$249.99 extension</strong> (90 days) if your window expires before you finish.</li>
        <li style={s.li}><strong style={s.strong}>Solo Website Build ($800)</strong> &mdash; standalone custom agent website for already-licensed Hawaii agents. No course component. License verification required before launch.</li>
      </ul>
      <p style={s.p}>
        Pricing, access windows, and feature lists are accurate as of the effective date below and may change for future enrollments. Your purchase locks in the terms in effect at the time you paid.
      </p>

      <h2 style={s.h2}>3. Course completion vs. licensure</h2>
      <p style={s.p}>
        Completing the Academy course is one of several requirements for a Hawaii salesperson license. It is <strong style={s.strong}>not</strong> a license. After course completion you must independently register and pass the <strong style={s.strong}>PSI Hawaii Salesperson Exam</strong>, find a sponsoring broker, and complete the Hawaii REC application. We are not affiliated with PSI testing, and a course-completion certificate alone does not authorize real estate practice.
      </p>

      <h2 style={s.h2}>4. Access windows and expiration</h2>
      <p style={s.p}>
        Standard access expires <strong style={s.strong}>90 days</strong> after enrollment. Plus access expires <strong style={s.strong}>180 days</strong> after enrollment. Solo Website Build has no expiration (you receive the delivered website + 12 months of hosting). Your profile displays the precise expiration timestamp at all times.
      </p>
      <p style={s.p}>
        On expiration, the only path forward for Standard is re-enrollment at the full Standard price. Plus students may purchase the one-time <strong style={s.strong}>$249.99 extension</strong> for 90 additional days of access. Your study history, quiz scores, and 60-hour state-law progress are preserved across re-enrollments.
      </p>

      <h2 style={s.h2}>5. Refunds</h2>
      <p style={s.p}>
        Course tuition is refundable in full within <strong style={s.strong}>7 days of purchase</strong> provided you have not completed more than 10% of the course content (measured by tracked study hours). Refund requests must be sent to <a href="mailto:support@ralphfoulger.com" style={{ color: '#14837b', textDecoration: 'underline' }}>support@ralphfoulger.com</a> and are typically processed within 3 business days.
      </p>
      <p style={s.p}>
        The Plus extension ($249.99) and Solo Website Build ($800) are non-refundable once delivered (the extension extends access immediately on purchase; the website build begins on receipt of payment).
      </p>

      <h2 style={s.h2}>6. Your account</h2>
      <p style={s.p}>
        You are responsible for keeping your account credentials secure. Don&rsquo;t share your login. Don&rsquo;t share course material outside the Academy. You may delete your account at any time from the profile page; deletion permanently removes your study records.
      </p>

      <h2 style={s.h2}>7. Acceptable use</h2>
      <p style={s.p}>
        Don&rsquo;t use the AI tutor or any other feature to attempt to extract bulk training data, circumvent rate limits, or scrape the platform. Don&rsquo;t redistribute audio narration, chapter content, quiz questions, or any portion of the curriculum.
      </p>

      <h2 style={s.h2}>8. Disclaimer</h2>
      <p style={s.p}>
        Course material is intended to prepare you for the Hawaii PSI Salesperson Exam and to satisfy the 60-hour pre-license requirement. It is <strong style={s.strong}>not</strong> legal, tax, or financial advice. Hawaii Revised Statutes and REC rules change; verify current requirements at <a href="https://cca.hawaii.gov/reb" target="_blank" rel="noopener" style={{ color: '#14837b', textDecoration: 'underline' }}>cca.hawaii.gov/reb</a> before relying on any material in a real transaction.
      </p>

      <h2 style={s.h2}>9. Liability</h2>
      <p style={s.p}>
        Our maximum liability to you for any claim related to the Academy is the total amount you paid us in the 12 months preceding the claim. We are not liable for indirect or consequential damages.
      </p>

      <h2 style={s.h2}>10. Governing law</h2>
      <p style={s.p}>
        These terms are governed by the laws of the State of Hawaii. Any dispute will be resolved in the courts of Honolulu County.
      </p>

      <h2 style={s.h2}>11. Changes</h2>
      <p style={s.p}>
        We may update these terms. Material changes will be announced by email and on the homepage. Continued use after the effective date of an update constitutes acceptance.
      </p>

      <div style={s.effective}>
        Effective 2026-05-13 · Questions: <a href="mailto:support@ralphfoulger.com" style={{ color: '#14837b' }}>support@ralphfoulger.com</a>
      </div>
    </article>
  );
}
