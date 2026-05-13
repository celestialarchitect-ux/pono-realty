import { policyStyles as s } from '@/lib/policies-style';

export const metadata = {
  title: 'Disclaimer — Ralph Foulger\'s Academy of Real Estate',
  description: 'What this course is, what it isn\'t, and what completion actually gets you.',
};

export default function DisclaimerPage() {
  return (
    <article>
      <div style={s.eyebrow}>Disclaimer</div>
      <h1 style={s.h1}>What this course actually is.</h1>
      <p style={s.intro}>
        Plain language about the role of the Academy in the Hawaii real estate licensing process &mdash; what it is, what it isn&rsquo;t, and what you still need to do after you finish.
      </p>

      <h2 style={s.h2}>1. We are a REC-approved pre-license course</h2>
      <p style={s.p}>
        Ralph Foulger&rsquo;s Academy of Real Estate is an approved Hawaii Real Estate Commission (REC) pre-license course provider. Completing our 20-chapter curriculum, logging the state-required 60 study hours, and passing our school final exam earns you a <strong style={s.strong}>course-completion certificate</strong> valid for two years per Hawaii REC rules.
      </p>

      <h2 style={s.h2}>2. A certificate is not a license</h2>
      <p style={s.p}>
        The certificate is one of several requirements for a Hawaii salesperson license. You must still:
      </p>
      <ul style={s.ul}>
        <li style={s.li}>Register and pass the <strong style={s.strong}>PSI Hawaii Salesperson Exam</strong> (national + state portions, 70% on each). PSI is the state&rsquo;s testing vendor; we are not affiliated with their test administration.</li>
        <li style={s.li}>Find a Hawaii-licensed sponsoring broker who will hold your license.</li>
        <li style={s.li}>Submit the application + fees to the Hawaii REC.</li>
        <li style={s.li}>Pass the standard background check.</li>
      </ul>

      <h2 style={s.h2}>3. Course material is study material, not legal advice</h2>
      <p style={s.p}>
        Everything in the curriculum &mdash; chapter readings, audiobook narration, math drills, glossary entries, quiz explanations, and AI tutor responses &mdash; is intended for <strong style={s.strong}>exam preparation</strong>. It is not legal, tax, or financial advice. Real estate practice involves consequential decisions; verify current Hawaii Revised Statutes and REC rules at <a href="https://cca.hawaii.gov/reb" target="_blank" rel="noopener" style={{ color: '#14837b', textDecoration: 'underline' }}>cca.hawaii.gov/reb</a> before relying on any material here in an actual transaction.
      </p>

      <h2 style={s.h2}>4. The AI tutor is a study aid, not a shortcut</h2>
      <p style={s.p}>
        The AI tutor will explain real estate concepts, walk through math problems, and answer questions about the Hawaii curriculum. It does <strong style={s.strong}>not</strong> have access to live MLS data, current property listings, sponsor-broker information, or anything outside the published Hawaii pre-license syllabus. It will also not take the exam for you, and it won&rsquo;t replace doing the reading.
      </p>

      <h2 style={s.h2}>5. Mock exams approximate, they don&rsquo;t replicate</h2>
      <p style={s.p}>
        Our 130-question mock exams mirror the PSI Hawaii Salesperson Exam in topic distribution (80 national + 50 state), passing threshold (70% on each portion), and difficulty band. They are <strong style={s.strong}>not</strong> actual PSI questions, and passing our mock does not guarantee passing the real exam. Treat the mock as a calibration tool, not a prediction.
      </p>

      <h2 style={s.h2}>6. No income guarantee</h2>
      <p style={s.p}>
        Real estate income depends on market conditions, your sponsoring broker, your network, your discipline, and luck. We don&rsquo;t guarantee any particular income outcome from passing the exam. Hawaii is a relationship-driven market that rewards multi-year effort; first-year median agent income is modest, and a substantial number of newly-licensed agents leave the industry within their first two years.
      </p>

      <h2 style={s.h2}>7. Plus-tier website timing</h2>
      <p style={s.p}>
        The custom agent website included with the Plus tier is delivered <strong style={s.strong}>after you pass</strong> the PSI Hawaii Salesperson Exam, not at the moment of enrollment. We hold delivery until passing because the website is built to your real name, REC license number, and sponsoring broker &mdash; details that don&rsquo;t exist until you&rsquo;ve cleared the exam. A monthly hosting / maintenance fee applies once the site is live; the rate is disclosed at delivery and is month-to-month.
      </p>

      <h2 style={s.h2}>8. Solo Website Build licensing</h2>
      <p style={s.p}>
        The standalone Solo Website Build ($800) is for already-licensed Hawaii brokers and salespersons. We verify your active license number through the Hawaii REC public search before the site goes live. If verification fails the build is paused and you can either resolve the license issue or request a full refund.
      </p>

      <h2 style={s.h2}>9. Not affiliated with PSI</h2>
      <p style={s.p}>
        PSI Services LLC administers the Hawaii Salesperson Exam under contract with the Hawaii Real Estate Commission. We are an approved pre-license course provider; we are <strong style={s.strong}>not</strong> a PSI testing center, we do not score the PSI exam, and we don&rsquo;t see your PSI exam result unless you tell us. Exam registration and rescheduling happen on PSI&rsquo;s site.
      </p>

      <div style={s.effective}>
        Effective 2026-05-13 · Questions: <a href="mailto:support@ralphfoulger.com" style={{ color: '#14837b' }}>support@ralphfoulger.com</a>
      </div>
    </article>
  );
}
