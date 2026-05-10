// Free Foundation Course — actual lesson content.
// Lead magnet: 5 lessons, ~45 min total, designed to either qualify or
// disqualify a candidate before they pay for the full curriculum.

export interface FreeLessonSection {
  heading: string;
  body: string;
}

export interface FreeLesson {
  slug: string;
  number: number;
  title: string;
  duration: string;
  summary: string;
  sections: FreeLessonSection[];
  takeaway: string;
}

export const FREE_LESSONS: FreeLesson[] = [
  {
    slug: 'lesson-1',
    number: 1,
    title: 'Is Real Estate Right for You?',
    duration: '8 min',
    summary: "A clear-eyed look at what the job actually is — the income realities, the personality fit, the time horizons. Walk away with a real answer.",
    sections: [
      {
        heading: 'What real estate actually is',
        body: "Most people picture real estate as showing pretty houses and signing contracts. The job is closer to project management mixed with sales psychology. You're shepherding the largest financial decision most people will ever make. Your daily work is part counselor, part tour guide, part marketer, part contract negotiator, and part emotional shock absorber when deals go sideways.",
      },
      {
        heading: 'The income shape — not the average, the SHAPE',
        body: "The headline number you see online (\"Hawaii agents earn $X\") is misleading. Real estate income is bimodal: most agents earn very little, a smaller group earns very well, and the top 10% earn most of the dollars in the entire state. In your first year, plan for $0–$30k. By year three, top performers cross six figures. Average career drop-out happens at month 18 — usually because someone underestimated how long it takes to build a pipeline.",
      },
      {
        heading: 'The personality fit',
        body: "Real estate rewards a specific cocktail: comfort with rejection, persistence under uncertainty, willingness to be the underdog, ability to network without feeling like a phony, and a high tolerance for unpredictable schedules. It punishes perfectionism, conflict avoidance, and people who need a steady paycheck to feel secure. Neither set is good or bad — but knowing which side you're on saves you a year of false starts.",
      },
      {
        heading: 'The time math',
        body: "Hawaii's real estate market runs on relationships built over years, not weeks. Top producers will tell you their best year was the result of work they did three years prior. If you're looking for income inside 6 months, real estate is the wrong vehicle. If you're willing to plant seeds for 18–24 months and harvest for the next 30 years — that's the actual deal.",
      },
    ],
    takeaway: "If you read all four sections and the energy still rises in you — keep going. If you felt deflated, that's also useful information. Better to find out now than after a $1,500 license investment.",
  },
  {
    slug: 'lesson-2',
    number: 2,
    title: 'Hawaii Market 101',
    duration: '10 min',
    summary: "How Hawaii real estate is different — leasehold vs fee simple, condo dominance, military buyers, mainland investors, the seasonal rhythms.",
    sections: [
      {
        heading: 'Leasehold vs fee simple — the FIRST thing that confuses every new agent',
        body: "On the U.S. mainland, almost all residential property is fee simple — you own the land plus the structure forever. In Hawaii, a meaningful percentage of properties (especially condos in older buildings, and significant tracts on Oahu and the Big Island) are leasehold — you own the structure and lease the land for a set term, often 30–55 years. When the lease expires, the land reverts to the lessor. A leasehold condo can sell for 30–60% less than a comparable fee simple unit. Get this wrong with a buyer and you've lost their trust forever.",
      },
      {
        heading: 'Condo dominance',
        body: "Honolulu's housing stock skews heavily toward condos and townhomes — especially in the urban core. Single-family detached homes are a relatively scarce premium product compared to mainland markets. This shapes everything: HOA fees, building reserve studies, condo-specific disclosures (Hawaii Revised Statutes 514B), and how listings are marketed. Mainland buyers often arrive expecting a yard and a garage and have to recalibrate.",
      },
      {
        heading: "Buyer archetypes you'll actually meet",
        body: "Hawaii buyers fall into rough buckets: military families (3-year PCS rotations, VA loans, fast decisions), mainland transplants (often retiring, often shocked at price-per-square-foot), local kama'aina families (generations of Hawaii roots, deeply community-driven), and investors (vacation rental focus, cash-heavy, often non-resident). Each has different motivations, decision speeds, and pain points. A good agent can diagnose which archetype someone is within 10 minutes.",
      },
      {
        heading: 'The seasonal rhythms',
        body: "Hawaii doesn't have a true seasonal market the way Boston or Chicago does — sales happen year-round. But there's a soft pattern: peak buyer activity from January through April (mainland snowbirds and military rotations), a summer plateau, and a slower autumn stretch. December is quiet. Inventory follows opposite: more sellers list in spring hoping to ride the activity wave. Smart agents lean into the off-season because competition is lower.",
      },
    ],
    takeaway: "Hawaii is its own market. National training will get you 70% there. The other 30% — leasehold, HARPTA, GET, condo law, kama'aina culture — is what separates average agents from career agents.",
  },
  {
    slug: 'lesson-3',
    number: 3,
    title: 'The License Pathway, Mapped',
    duration: '7 min',
    summary: "The exact 60-hour pre-license course requirement, the PSI exam (80 + 50 questions), the application process, and finding a sponsoring broker.",
    sections: [
      {
        heading: 'Step 1: Eligibility',
        body: "You must be 18+, have a high school diploma or equivalent, be a U.S. citizen or work-authorized, and not have certain disqualifying criminal history (most felonies trigger a review, not an automatic denial — apply anyway and let the Commission decide). Most candidates are eligible.",
      },
      {
        heading: 'Step 2: 60-hour Salesperson Pre-License course',
        body: "Hawaii requires a 60-hour pre-license course at a REC-approved school. The course must be completed and you must pass the school's final exam (typically 70%+ to certify). The course completion certificate is valid for 2 years from issuance — that's how long you have to take and pass the state exam.",
      },
      {
        heading: 'Step 3: The PSI exam (the gatekeeper)',
        body: "The actual licensing exam is administered by PSI Services. Format: 80 national questions + 50 Hawaii state questions, 4 hours total, 70% to pass each portion separately. Cost: $61 per attempt. You can take it as many times as you need — but each retake is another $61, plus weeks of waiting. The statewide first-attempt pass rate is 40–45%. Schools that prep well push their students into the upper half of that.",
      },
      {
        heading: 'Step 4: Application + sponsoring broker',
        body: "Once you pass PSI, you submit the salesperson license application to the Hawaii REC ($282–$382 depending on year). You CANNOT activate your license without a sponsoring broker — meaning a licensed Hawaii brokerage that agrees to hold your license under their supervision. Finding one is its own challenge: most brokerages interview new agents on personality fit, career commitment, and 90-day plans. Start scouting brokerages while you're still studying — don't wait until you have the license in hand.",
      },
      {
        heading: 'Total time + total cost',
        body: "Realistic timeline: 2–4 months from enrollment to license activation if you study consistently. Total dollar cost: roughly $740–$1,500 depending on which school you choose, how many exam attempts you take, and whether you spring for premium prep tools. Compared to most professional licenses, this is fast and cheap — the hard part isn't the money, it's the discipline.",
      },
    ],
    takeaway: "Six months from today, if you commit, you can hold an active Hawaii salesperson license and be sitting at a brokerage desk. The path is well-defined. The work is what most people skip.",
  },
  {
    slug: 'lesson-4',
    number: 4,
    title: 'The Real Income Picture',
    duration: '9 min',
    summary: "Commission splits, brokerage fees, MLS dues, E&O insurance, taxes (you're a 1099). What new agents actually take home in year one — not the brochure number.",
    sections: [
      {
        heading: 'You are a 1099 contractor',
        body: "Real estate agents in Hawaii are independent contractors of their sponsoring brokerage. You receive 1099s, not W-2s. Nobody withholds taxes. There's no employer-paid health insurance. There's no PTO. There's no unemployment if it goes sideways. The upside: you set your own schedule and your income ceiling is uncapped. The downside: every dollar of risk lives with you.",
      },
      {
        heading: 'How commission actually works',
        body: "When a deal closes, the GROSS commission (typically 5–6% of sale price, paid by the seller) is split between the listing brokerage and the buyer's brokerage — usually 50/50. Then YOUR brokerage takes their cut from your side (commonly a 70/30 split at the start, meaning you keep 70% of your side and the brokerage takes 30%). On a $1M sale at a 5% gross commission with a 50/50 broker split and a 70/30 agent split, your gross take is $17,500. Sounds great. Read the next section before you celebrate.",
      },
      {
        heading: "The expenses they don't tell you about",
        body: "From your gross commission, subtract: federal + state income tax (~30%), self-employment tax (15.3% on the first $168k), brokerage desk fee or transaction fee ($50–$300/deal), MLS dues (~$50/month), Realtor association dues (~$700/year), E&O insurance ($300–$700/year), license renewal fees, marketing costs (signs, photography, ads), continuing education, business mileage, phone, lockbox fees, and a long tail of $20–$100 line items. Realistic net after all of it on that $17,500 gross? Roughly $10,000–$11,500.",
      },
      {
        heading: 'Year one, statistically',
        body: "National data: the median first-year agent closes 1–3 transactions and earns $5,000–$25,000 net. In Hawaii's higher-priced market, single transactions pay more, but volume is the bottleneck — your sphere of influence is smaller, your name recognition is zero, and your competition has 5+ years of relationship equity. Most successful agents have 6–12 months of living expenses saved before they activate. That's not pessimism — it's the actual math.",
      },
      {
        heading: 'Years three and beyond',
        body: "By year three, agents who survived the attrition phase typically close 8–15 transactions/year and net $80k–$200k+. The top quintile crosses $300k. The compounding effect is real: every closed client becomes a referral source, and the cost of acquiring deal #50 is much lower than the cost of acquiring deal #5. The career rewards persistence at a non-linear rate — but you have to make it through years 1–2 first.",
      },
    ],
    takeaway: "If you go in expecting year one to pay your rent — you'll quit at month 11. If you go in with savings, a clear-eyed plan, and the patience to plant before harvesting — Hawaii real estate is one of the best income vehicles available without an advanced degree.",
  },
  {
    slug: 'lesson-5',
    number: 5,
    title: '5 Things Every Hawaii Agent Knows on Day 1',
    duration: '12 min',
    summary: "HARPTA, GET, the standard purchase contract, the agency disclosure, and how to read a leasehold lease. The bare minimum to not embarrass yourself with your first client.",
    sections: [
      {
        heading: '1. HARPTA — Hawaii Real Property Tax Act',
        body: "When a non-Hawaii-resident sells real property in Hawaii, the buyer must withhold 7.25% of the gross sales price and remit it to the Hawaii Department of Taxation as a tax prepayment. The seller can apply for a refund or reduced withholding via Form N-288B if their actual gain is less than the withheld amount. This catches mainland sellers off guard constantly. As the agent, you must surface this in every transaction where the seller is non-resident — failing to disclose it is a fast track to a complaint.",
      },
      {
        heading: '2. GET — General Excise Tax',
        body: "Hawaii doesn't have a sales tax — it has a General Excise Tax (GET) on gross business income, which IS passed through to consumers but operates differently. For real estate, GET applies to commissions (currently 4–4.5% depending on county) and to rental income on most rental properties. As an agent, your sponsoring brokerage handles GET on your commissions, but you'll need to understand it for client conversations — especially anyone considering a vacation rental purchase.",
      },
      {
        heading: '3. The Hawaii standard purchase contract',
        body: "Hawaii uses a specific standard purchase contract (often the HAR Standard Form) with several state-specific addenda required for most transactions: Lead-Based Paint disclosure (federal), Hawaii Sellers Real Property Disclosure Statement (HRS 508D), HOA/Condo addenda (HRS 514B), HARPTA addendum, leasehold addendum (when applicable), and county-specific addenda for some islands. Memorize the structure. Know which addendum attaches when. This is tested directly on the state exam.",
      },
      {
        heading: '4. Agency disclosure (HRS 467 and related rules)',
        body: "Hawaii requires agency disclosure at the FIRST contact with a consumer where substantive discussion occurs — not at offer time. The disclosure clarifies whether you represent the buyer, the seller, both (dual agency, allowed in Hawaii but heavily regulated), or neither (transaction broker). Failing to deliver and document this disclosure on time is the single most common license-law violation in Hawaii. The form lives in HRS Chapter 467.",
      },
      {
        heading: '5. How to read a leasehold lease',
        body: "When you walk a buyer into a leasehold property, you must be able to read the lease and explain: lease term remaining, ground rent (current and reset schedule), reset clauses (when does ground rent recalculate and how), renegotiation rights, surrender clauses (what happens at term end), and assignment rights (can the buyer sell before lease ends). Misreading any of these can cost the buyer hundreds of thousands of dollars over the lease term. This is the single highest-skill, highest-leverage knowledge area in Hawaii residential real estate.",
      },
    ],
    takeaway: "These five aren't every Hawaii-specific rule — but they are the five that separate a professional from someone with a license. Knowing them in your bones is the difference between clients trusting you and clients quietly switching to another agent.",
  },
];

export function getLesson(slug: string): FreeLesson | null {
  return FREE_LESSONS.find((l) => l.slug === slug) ?? null;
}

export function getNeighbors(slug: string): { prev: FreeLesson | null; next: FreeLesson | null } {
  const idx = FREE_LESSONS.findIndex((l) => l.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? FREE_LESSONS[idx - 1] : null,
    next: idx < FREE_LESSONS.length - 1 ? FREE_LESSONS[idx + 1] : null,
  };
}
