// Original educational content for the Hawaii STATE portion of the PSI exam.
// Sourced from public Hawaii Revised Statutes (HRS), HAR Title 16 Chapter 99,
// and the PSI Content Outline. Cite-checked against publicly available state
// resources. Not legal advice; not a substitute for the 60-hour course.

import type { ChapterContent } from './national';

export const STATE_CONTENT: ChapterContent[] = [
  // ─── 12. Hawaii Material Facts ───
  {
    slug: 'hi-material-facts',
    intro: 'Hawaii has unique disclosure obligations rooted in its land history, leasehold prevalence, and tax rules.',
    overview: [
      'Hawaii has two parallel land-recording systems. The Bureau of Conveyances (BOC) handles "Regular System" recordings — the standard county-style chain of recorded documents. The Land Court system, unique to Hawaii, issues a Transfer Certificate of Title (TCT) for parcels brought under it; title is conclusive once registered. A property may be in one system, the other, or split. Agents must know which when ordering title.',
      'HARPTA (Hawaii Real Property Tax Act) requires a withholding (currently 7.25% of sale price) at closing when the seller is a non-Hawaii-resident. This is a withholding against the seller\'s eventual Hawaii income tax liability, not an additional tax. Buyers are responsible for withholding; failure exposes the buyer to the unpaid liability. FIRPTA is the federal counterpart — 15% withholding on foreign sellers.',
      'GET (General Excise Tax) is Hawaii\'s tax on business activity, including real estate brokerage commissions and most rental income. It is not a "sales tax" — it falls on the gross receipts of the business and is typically passed to the customer. Real estate licensees must factor GET into their commissions and disclose appropriately.',
      'The Seller\'s Property Disclosure Statement is required by HRS 508D for residential sales. The seller must disclose all known material facts about the property\'s condition. The buyer has rescission rights if disclosure is materially inaccurate. Leasehold properties carry additional mandatory leasehold disclosure under HRS 514E for condos and various statutes for fee-leasehold splits. The unique Hawaiian land tenure history makes leasehold disclosures especially important.',
    ],
    concepts: [
      { term: 'Bureau of Conveyances (BOC)', body: 'State office maintaining the Regular System chain of title for non-Land-Court parcels.', hawaiiNote: 'Located in Honolulu; serves all islands.' },
      { term: 'Land Court / TCT', body: 'Hawaii\'s Torrens-style registered title system. Transfer Certificate of Title is conclusive.' },
      { term: 'HARPTA', body: 'Hawaii Real Property Tax Act. 7.25% withholding on non-resident seller proceeds at closing.' },
      { term: 'FIRPTA', body: 'Federal Foreign Investment in Real Property Tax Act. 15% federal withholding on foreign sellers.' },
      { term: 'GET', body: 'General Excise Tax. Hawaii\'s gross-receipts business tax, including real estate commissions and rents.' },
      { term: 'Conveyance tax', body: 'Hawaii state tax on real property transfers. Tiered rate based on price + buyer status.' },
      { term: 'HRS 508D', body: 'Mandatory Seller Disclosures statute for residential resales.' },
      { term: 'HRS 514E', body: 'Time share and leasehold disclosures for condominium properties.' },
      { term: 'Material fact', body: 'Anything reasonable buyer would consider important. Disclose if known.' },
      { term: 'Lava-zone disclosure', body: 'Hawaii County requires disclosure of lava-flow hazard zones (1–9).' },
      { term: 'Tsunami evacuation zone', body: 'Coastal-area disclosure where applicable.' },
      { term: 'TMK (Tax Map Key)', body: 'Hawaii\'s parcel identifier: Zone-Section-Plat-Parcel(-CPR).' },
    ],
    practice: [
      { q: 'A seller from California sells a Maui house to a Hawaii resident. The buyer is responsible for withholding under:', options: ['FIRPTA', 'HARPTA', 'GET', 'RESPA'], correctIndex: 1, explain: 'Non-Hawaii-resident seller triggers HARPTA withholding (7.25% of sale price).' },
      { q: 'Hawaii\'s parallel-to-Torrens registered title system is called:', options: ['BOC', 'Land Court', 'CPR', 'TMK'], correctIndex: 1, explain: 'Land Court issues a TCT (Transfer Certificate of Title) — conclusive.' },
      { q: 'Hawaii\'s tax on real estate commissions falls under:', options: ['HARPTA', 'FIRPTA', 'GET', 'Conveyance tax'], correctIndex: 2, explain: 'GET applies to real estate brokerage business gross receipts.' },
      { q: 'TMK identifies:', options: ['Tax type', 'Property parcel ID (Zone-Section-Plat-Parcel)', 'Tenant\'s mortgage key', 'Title insurer'], correctIndex: 1, explain: 'TMK = Tax Map Key, the unique parcel identifier.' },
    ],
  },

  // ─── 13. Hawaii Types of Ownership ───
  {
    slug: 'hi-types-of-ownership',
    intro: 'Hawaii is condo-heavy and leasehold-rich. The state portion tests these structures more than typical state exams.',
    overview: [
      'Condominiums in Hawaii are governed by HRS 514B (the modern Condominium Property Act). Every condo project has a recorded Declaration, Bylaws, House Rules, and an Association of Apartment Owners (AOAO). Owners pay maintenance fees ("monthly common-element assessments"); the AOAO can place liens for unpaid amounts. Hawaii also has older HRS 514A condos (pre-2006) — agents must verify which act governs.',
      'CPRs (Condominium Property Regimes) are uniquely Hawaiian. A single house lot can be carved into two or more "units" (often two homes on one parcel) under a CPR declaration. Each unit gets its own TMK and can be sold separately. CPRs let two owners share a parcel without a partition action.',
      'Leasehold is far more common in Hawaii than in mainland markets. Buyers acquire only the leasehold interest; the underlying land remains owned by the lessor (often a major landowner like Kamehameha Schools or Bishop Estate). Lease terms run 30-75+ years with renegotiation or step-up provisions. Disclosure of remaining lease term, lease rent, and renegotiation dates is mandatory under HRS 514E and other statutes.',
      'Time share plans (HRS 514E) are heavily regulated. Disclosures must include the right to rescind within 7 days of signing. Sales are subject to Hawaii\'s separate time share license endorsement. Cooperatives are rare in Hawaii; PUDs exist but are less common than condos.',
    ],
    concepts: [
      { term: 'HRS 514B', body: 'Hawaii\'s modern Condominium Property Act (post-2006). Governs declarations, AOAO, owner rights.' },
      { term: 'HRS 514A', body: 'Older condo act. Some pre-2006 projects still operate under it.' },
      { term: 'AOAO', body: 'Association of Apartment Owners. The condo HOA equivalent. Manages common elements.' },
      { term: 'Declaration / Bylaws / House Rules', body: 'The three governing documents recorded against the project.' },
      { term: 'CPR', body: 'Condominium Property Regime. Uniquely Hawaiian. Two or more units on one lot, each with own TMK.' },
      { term: 'Leasehold interest', body: 'Tenant\'s long-term right to occupy land owned by a lessor. Common in Hawaii.' },
      { term: 'Fee simple', body: 'Outright land ownership. Often distinguished sharply from leasehold here.' },
      { term: 'Lease rent', body: 'Periodic payment from leaseholder to fee-owner.' },
      { term: 'Lease step-up / renegotiation', body: 'Scheduled date when lease rent is reset upward, often dramatically.' },
      { term: 'Time share', body: 'Right to occupy a unit for set period each year. HRS 514E governs disclosure.' },
      { term: '7-day rescission (time share)', body: 'Buyer\'s statutory right to cancel a time share contract.' },
      { term: 'Hui', body: 'Traditional Hawaiian co-ownership of land. Often family-held. Beware partition issues.' },
    ],
    practice: [
      { q: 'A "CPR" in Hawaii most commonly means:', options: ['Cardiopulmonary resuscitation', 'Condominium Property Regime — multiple units on one lot', 'Continuous Property Recording', 'County Property Rule'], correctIndex: 1, explain: 'In Hawaii real estate, CPR = Condominium Property Regime.' },
      { q: 'A buyer acquires a 50-year leasehold condo. They own:', options: ['The land + building', 'The leasehold interest in the unit only', 'The fee + lease', 'Stock in the AOAO'], correctIndex: 1, explain: 'Leasehold = right to occupy. Land remains with lessor.' },
      { q: 'A modern condo declaration in Hawaii is governed primarily by:', options: ['HRS 514A', 'HRS 514B', 'HRS 521', 'HRS 467'], correctIndex: 1, explain: 'HRS 514B governs post-2006 condominiums.' },
      { q: 'A time share buyer in Hawaii has the right to rescind within:', options: ['3 days', '7 days', '14 days', '30 days'], correctIndex: 1, explain: 'HRS 514E gives a 7-day rescission window.' },
      { q: 'Lease rent step-up means:', options: ['The lease can be assigned', 'Lease rent resets at a scheduled date, often higher', 'The lessee gains fee', 'The lease terminates'], correctIndex: 1, explain: 'Step-up = scheduled rent reset, frequently a steep increase.' },
    ],
  },

  // ─── 14. Hawaii Property Management ───
  {
    slug: 'hi-property-management',
    intro: 'HRS 521 (Residential Landlord-Tenant Code) controls every long-term rental in Hawaii.',
    overview: [
      'HRS 521 covers most residential rentals. Key tenant protections: written lease for terms over a year, security deposit limited to one month\'s rent (plus a separate pet deposit allowance), 14-day return requirement after move-out (with itemized deductions), 28-day notice for periodic-tenancy termination, no retaliatory eviction.',
      'Eviction (called "summary possession") requires court order. Self-help eviction (changing locks, removing belongings, cutting utilities) is illegal and creates statutory damages. Notice periods vary by cause: 5-day for non-payment, 10-day for material breach, 45-day for no-cause termination of month-to-month.',
      'Disclosure requirements: lead-paint (federal, pre-1978), security-deposit accounting at move-out, and the contact information of the landlord/agent. Hawaii requires a written notice of any rent increase 45 days in advance for month-to-month tenancies.',
      'A property manager must hold a Hawaii real estate broker license to manage another\'s property for compensation. Trust account rules from HRS 467 apply: tenant security deposits must be held in trust, separate from the broker\'s funds. Mishandling deposits is one of the top three license-revocation causes.',
    ],
    concepts: [
      { term: 'HRS 521', body: 'Hawaii Residential Landlord-Tenant Code. Governs nearly all residential leases.' },
      { term: 'Security deposit cap', body: 'One month\'s rent (separate pet deposit allowed for some pets).' },
      { term: 'Deposit return', body: '14 days after move-out, itemized deductions or full return.' },
      { term: 'Summary possession', body: 'Court eviction process. Self-help eviction is illegal.' },
      { term: 'Retaliatory eviction', body: 'Eviction in response to tenant\'s lawful action. Illegal under HRS 521.' },
      { term: '45-day rent-increase notice', body: 'Required for month-to-month tenancies.' },
      { term: '5-day notice', body: 'For non-payment of rent.' },
      { term: '10-day notice', body: 'For material breach (fixable).' },
      { term: '28-day notice', body: 'Standard periodic tenancy termination by tenant.' },
      { term: 'Trust account (PM)', body: 'Tenant deposits held separately from broker funds. HRS 467 + admin rules apply.' },
    ],
    practice: [
      { q: 'A landlord must return the security deposit within how many days of move-out?', options: ['7', '14', '30', '60'], correctIndex: 1, explain: 'HRS 521 — 14 days, with itemized deductions if any.' },
      { q: 'The maximum security deposit allowed in Hawaii is:', options: ['½ month\'s rent', '1 month\'s rent', '2 months\' rent', '3 months\' rent'], correctIndex: 1, explain: 'Capped at one month\'s rent.' },
      { q: 'Self-help eviction (changing locks) is:', options: ['Allowed after 5-day notice', 'Allowed in Hawaii', 'Illegal — must use summary possession', 'Allowed only for non-payment'], correctIndex: 2, explain: 'Court order required; self-help is illegal.' },
      { q: 'For a month-to-month rent increase, landlord must give:', options: ['14 days notice', '28 days notice', '45 days notice', '60 days notice'], correctIndex: 2, explain: '45 days advance written notice required.' },
    ],
  },

  // ─── 15. Hawaii Land Utilization ───
  {
    slug: 'hi-land-utilization',
    intro: 'Hawaii has a unique two-tier land-use system: state district + county zoning.',
    overview: [
      'The State Land Use Commission (LUC) classifies all Hawaii land into four districts: Urban, Rural, Agricultural, and Conservation. Each county then applies its own zoning within those state districts. To develop in Conservation or Agricultural land, special permits and often LUC reclassification are required — a long, public-comment-driven process.',
      'Special Management Areas (SMAs) are coastal-zone areas where development is heavily regulated under the Coastal Zone Management Act. Any "development" within an SMA (broadly defined — even building a deck, in some cases) requires an SMA permit from the county. Disclose SMA boundaries and applicable permits to buyers.',
      'County zoning ordinances govern the standard items: residential vs commercial, density, height, setbacks. Each of Hawaii\'s four counties (Honolulu, Hawaii, Maui, Kauai) has its own ordinance and Board of Variances. Honolulu uses the Land Use Ordinance (LUO).',
      'Restrictive covenants (CC&Rs) and HOA rules layer on top of county zoning. Many older neighborhoods have race-restrictive covenants that are unenforceable but often still appear in the title chain — Hawaii recognizes them as void but agents should know the issue.',
    ],
    concepts: [
      { term: 'Land Use Commission (LUC)', body: 'State body that classifies all land into four districts.' },
      { term: 'State land-use districts', body: 'Urban, Rural, Agricultural, Conservation.' },
      { term: 'County zoning', body: 'Each county applies own zoning within state districts.' },
      { term: 'Special Management Area (SMA)', body: 'Coastal-zone heavy regulation. Permits required for most development.' },
      { term: 'Land Use Ordinance (LUO)', body: 'Honolulu county zoning code.' },
      { term: 'Conservation land', body: 'Most restrictive state district. Development extremely limited.' },
      { term: 'Agricultural land', body: 'Often used for residential despite designation; "ag" homes have special rules.' },
      { term: 'Lava zones', body: 'Hawaii County 1-9 hazard rating. Disclose; affects insurance.' },
      { term: 'Tsunami evacuation zone', body: 'Coastal disclosure required where applicable.' },
    ],
    practice: [
      { q: 'Hawaii\'s four state land use districts are:', options: ['Residential, Commercial, Industrial, Agricultural', 'Urban, Rural, Agricultural, Conservation', 'Honolulu, Maui, Kauai, Hawaii', 'Single, Multi, Mixed, Open'], correctIndex: 1, explain: 'LUC classifies land into Urban, Rural, Ag, and Conservation.' },
      { q: 'A coastal-zone area requiring development permit is called:', options: ['CPR', 'AOAO', 'SMA', 'TMK'], correctIndex: 2, explain: 'Special Management Area requires SMA permit.' },
      { q: 'County zoning in Honolulu is governed by:', options: ['HRS 521', 'LUO', 'TCT', 'GET'], correctIndex: 1, explain: 'Honolulu Land Use Ordinance.' },
    ],
  },

  // ─── 16. Hawaii Title & Conveyances ───
  {
    slug: 'hi-title-conveyances',
    intro: 'Two title systems, leasehold dominance, and unique Hawaiian estates.',
    overview: [
      'Title in Hawaii lives in two systems. Regular System uses the Bureau of Conveyances chain-of-title model — recording protects subsequent purchasers. Land Court uses the Torrens model: a Transfer Certificate of Title (TCT) is conclusive. Once registered in Land Court, a parcel\'s ownership cannot generally be challenged outside the registration system.',
      'Tenancies in Hawaii follow standard categories: tenancy in common (separate inheritable shares), joint tenancy (with right of survivorship — must use the language "as joint tenants with right of survivorship"), and tenancy by the entirety (married couples; survivorship + creditor protection on individual debt).',
      'Liens in Hawaii: real property tax liens take priority over almost everything except prior recorded mortgages on Land Court parcels. Mechanic\'s liens (HRS 507) protect contractors and suppliers. AOAO liens for unpaid maintenance fees in condos. State and federal tax liens follow recording priority within their classes.',
      'Foreclosure in Hawaii has two paths. Judicial foreclosure (court-supervised) is required for some loans and gives more borrower protection. Non-judicial (power-of-sale) foreclosure is faster and uses the Mortgage Foreclosure Act\'s notice and auction procedures (HRS 667). Hawaii also has alternate Mortgage Foreclosure Dispute Resolution (MFDR) for owner-occupied homes.',
    ],
    concepts: [
      { term: 'Regular System', body: 'Standard recorded chain-of-title at Bureau of Conveyances.' },
      { term: 'Land Court', body: 'Hawaii\'s Torrens system. TCT is conclusive.' },
      { term: 'TCT', body: 'Transfer Certificate of Title issued by Land Court.' },
      { term: 'Tenancy by the entirety', body: 'Spousal co-ownership with survivorship + creditor protection.' },
      { term: 'Mechanic\'s lien (HRS 507)', body: 'Contractor/supplier lien for unpaid work or materials.' },
      { term: 'AOAO lien', body: 'Condo association lien for unpaid maintenance fees.' },
      { term: 'Judicial foreclosure', body: 'Court-supervised. Slower but more protections.' },
      { term: 'Non-judicial foreclosure', body: 'Power-of-sale. Faster. Governed by HRS 667.' },
      { term: 'MFDR', body: 'Mortgage Foreclosure Dispute Resolution. Alternative for owner-occupied.' },
    ],
    practice: [
      { q: 'A parcel registered in Land Court is evidenced by:', options: ['Quitclaim deed', 'TCT', 'Plat map', 'CPR declaration'], correctIndex: 1, explain: 'Land Court issues a Transfer Certificate of Title.' },
      { q: 'Hawaii\'s mechanic\'s lien statute is:', options: ['HRS 467', 'HRS 507', 'HRS 514B', 'HRS 521'], correctIndex: 1, explain: 'HRS 507 governs mechanic\'s and materialman\'s liens.' },
      { q: 'Non-judicial foreclosure procedures are governed by:', options: ['HRS 521', 'HRS 667', 'HRS 514B', 'HRS 467'], correctIndex: 1, explain: 'HRS 667 governs Hawaii foreclosure procedures.' },
    ],
  },

  // ─── 17. Hawaii Contracts & Addenda ───
  {
    slug: 'hi-contracts-addenda',
    intro: 'Hawaii uses standardized purchase forms with required addenda. Know which addendum attaches when.',
    overview: [
      'The Hawaii Association of REALTORS® publishes the most-used standard residential purchase contract ("DROA" — Deposit Receipt Offer and Acceptance). Every Hawaii agent should be able to read it cold and identify each section. The DROA is a starting template — modifications require careful drafting.',
      'Required addenda by transaction type. Lead-paint addendum for pre-1978 housing (federal). Seller\'s Real Property Disclosure Statement (HRS 508D). Condominium Public Report addendum for new condos. Hawaii Association of REALTORS® lead-based paint addendum. As-is addendum, contingency addenda, and counter-offer forms.',
      'Listing agreements in Hawaii follow the same exclusive-right-to-sell, exclusive-agency, and open-listing structures as elsewhere. Dual-agency consent forms are mandatory and must be signed before any dual representation begins. Designated-agency arrangements within a brokerage are also typical.',
      'Common contract pitfalls: failing to specify whether contingencies are passive ("expires unless objected to") or active ("requires written notice to remove"); failing to state whether closing date is "time of the essence"; ambiguity on who pays which closing costs; missing addenda that void disclosure protection.',
    ],
    concepts: [
      { term: 'DROA', body: 'Deposit Receipt Offer and Acceptance — Hawaii\'s standard residential purchase form.' },
      { term: 'Lead-paint addendum', body: 'Federal mandate for pre-1978 housing. Buyer 10-day inspection right.' },
      { term: 'HRS 508D disclosure', body: 'Seller\'s Real Property Disclosure Statement. Required for residential resales.' },
      { term: 'Condominium Public Report', body: 'Required attachment for new condo sales. Discloses project info to buyer.' },
      { term: 'As-is addendum', body: 'Buyer accepts current condition; doesn\'t override mandatory disclosures.' },
      { term: 'Dual agency consent', body: 'Written form required when broker represents both sides.' },
      { term: 'Designated agency', body: 'Different agents in same firm represent opposite sides.' },
    ],
    practice: [
      { q: 'Hawaii\'s standard residential purchase contract is:', options: ['CC&R', 'DROA', 'CPR', 'TCT'], correctIndex: 1, explain: 'Deposit Receipt Offer and Acceptance.' },
      { q: 'For a 1965-built house, a buyer must receive:', options: ['Conservation easement disclosure', 'Lead-paint addendum + EPA pamphlet', 'Time share rescission notice', 'CPR declaration'], correctIndex: 1, explain: 'Pre-1978 housing requires lead-paint disclosure.' },
      { q: 'Dual agency in Hawaii requires:', options: ['Verbal consent only', 'Written consent from both parties', 'Broker\'s sole consent', 'No consent if commission is disclosed'], correctIndex: 1, explain: 'HRS 467 + best practice: written informed consent from both.' },
    ],
  },

  // ─── 18. Hawaii Financing ───
  {
    slug: 'hi-financing',
    intro: 'Beyond standard mortgages, Hawaii sees more agreement-of-sale financing and unique lender quirks.',
    overview: [
      'Agreement of Sale ("AOS") is a Hawaii-flavored installment land contract. The buyer takes possession but legal title stays with seller until purchase price is paid. Common when a buyer can\'t qualify for conventional financing or for leasehold-conversion deals. AOS is recordable and creates an equitable interest. Default remedies follow contract terms but generally require notice + cure period.',
      'Purchase Money Mortgage (PMM) is seller financing where the seller takes back a mortgage instead of all-cash. Common in Hawaii for high-end and unique properties where conventional lenders are slow or skeptical. The PMM is junior to any senior institutional financing.',
      'Hawaii institutional lenders include local credit unions (HSFCU, Aloha Pacific, etc.), Bank of Hawaii, First Hawaiian Bank, Central Pacific Bank, plus mainland and online lenders. Local lenders often have better insight into leasehold deals, condo project warrantability, and CPR quirks.',
      'Hawaii has a usury statute (HRS 478) capping consumer loan interest. Most institutional loans are exempted; the cap matters mostly in private lending and seller financing. The 2026 cap and exemptions should be verified annually.',
    ],
    concepts: [
      { term: 'Agreement of Sale (AOS)', body: 'Hawaii installment land contract. Buyer occupies; seller holds title until paid.' },
      { term: 'Purchase Money Mortgage (PMM)', body: 'Seller-financed mortgage taken back at sale.' },
      { term: 'Wraparound mortgage', body: 'New larger loan "wraps" existing. Used in seller financing.' },
      { term: 'HRS 478', body: 'Hawaii usury statute. Caps interest on certain non-institutional loans.' },
      { term: 'Warrantable condo', body: 'Condo project meeting Fannie/Freddie standards. Easier to finance.' },
      { term: 'Non-warrantable condo', body: 'Project failing Fannie/Freddie standards. Often requires portfolio lender.' },
    ],
    practice: [
      { q: 'In an Agreement of Sale, legal title:', options: ['Passes to buyer immediately', 'Stays with seller until paid in full', 'Passes to escrow', 'Passes to lender'], correctIndex: 1, explain: 'AOS = installment land contract; title held by seller pending full payment.' },
      { q: 'A PMM is typically:', options: ['Senior to institutional financing', 'Junior to senior institutional liens', 'Identical to a HELOC', 'Required by FHA'], correctIndex: 1, explain: 'PMMs typically sit junior to existing senior loans.' },
    ],
  },

  // ─── 19. Hawaii Escrow & Closing ───
  {
    slug: 'hi-escrow-closing',
    intro: 'Hawaii is an "escrow state" — a neutral escrow holds everything and disburses on closing.',
    overview: [
      'In Hawaii, virtually all residential transactions go through escrow. The escrow agent (a licensed escrow company under HRS 449) is a neutral third party holding funds, deeds, and instructions. Escrow opens with the executed purchase contract and earnest money. Escrow closes when all conditions are satisfied: inspection waivers, financing commitments, title clearance, signed deed, buyer\'s funds, and any required disclosures.',
      'Closing statements summarize every credit and debit. Modern closings use the federal Closing Disclosure form for residential mortgage loans. Items include sales price, deposits, loan proceeds, prorations (taxes, condo fees, lease rent), conveyance tax, escrow fee, title insurance premiums, recording fees, and net to seller.',
      'Conveyance tax: Hawaii imposes a state-level transfer tax based on sale price and buyer category (owner-occupant vs investor). Tiered rates make this a calculation question on the exam — verify the current rate schedule annually.',
      'Common prorations: real property taxes (semiannual), condo maintenance fees (monthly), lease rent (varies), and rents-in-place (for income property). Hawaii typically prorates using the actual day count (365-day year) at closing — not 360 — though contracts can specify otherwise.',
    ],
    concepts: [
      { term: 'Escrow', body: 'Neutral third party holding funds + documents until conditions met.' },
      { term: 'HRS 449', body: 'Hawaii Escrow Depositories statute.' },
      { term: 'Closing Disclosure', body: 'Federal CD form replacing HUD-1 for most residential loans.' },
      { term: 'Conveyance tax', body: 'Hawaii state transfer tax. Tiered rates by price + buyer status.' },
      { term: 'Recording fees', body: 'Bureau of Conveyances or Land Court charges per page recorded.' },
      { term: 'Net to seller', body: 'Sale price minus all seller debits; the wire-out at closing.' },
      { term: '365-day proration', body: 'Hawaii contracts usually prorate on actual day count.' },
    ],
    practice: [
      { q: 'In a Hawaii residential sale, who typically holds funds and documents during the transaction?', options: ['Listing agent', 'Buyer\'s attorney', 'Neutral escrow company', 'Lender'], correctIndex: 2, explain: 'Hawaii is an escrow state — a neutral escrow handles closing.' },
      { q: 'Hawaii state-level tax on real property transfers is:', options: ['HARPTA', 'GET', 'Conveyance tax', 'Stamp tax'], correctIndex: 2, explain: 'Conveyance tax is the transfer tax.' },
    ],
  },

  // ─── 20. Hawaii Professional Practices & Conduct ───
  {
    slug: 'hi-professional-conduct',
    intro: 'HRS 467 + HAR Title 16 Chapter 99 are the bedrock of Hawaii license law. This section is the largest weight on the state portion (14 items).',
    overview: [
      'Two license categories. Salesperson — must be 18+, complete the 60-hour Salesperson pre-licensing course, pass the PSI exam (national + state, 70% on each), be sponsored by a Hawaii broker, and pay licensing fees (currently in the $300+ range; verify current). Broker — must hold a current salesperson license, complete the 80-hour Broker pre-licensing course, demonstrate experience (typically 3 years active license + minimum transaction volume), pass broker exam, and meet additional requirements.',
      'Continuing education: 20 hours every 2 years (per the current license cycle), including a state-mandated Core Course (typically a 6-hour update), with the rest in elective topics. Late renewal carries fees and possible inactive status. Inactive licensees may not practice.',
      'Trust account rules (HRS 467 + HAR §16-99): all client funds held in a Hawaii bank, separate from broker\'s operating account, properly identified ("Trust Account" or "Client Trust Account"), reconciled monthly, records retained 3 years (or longer per current rules). Commingling and conversion are top discipline triggers.',
      'Disciplinary grounds include: misrepresentation, fraud, commingling, conversion, undisclosed dual agency, discrimination (state and federal), failure to supervise, advertising violations, conviction of crime involving moral turpitude, drug/alcohol abuse impairing practice. The Real Estate Commission may revoke, suspend, fine, or place on probation. Civil and criminal liability layer on top.',
      'Mandatory agency disclosure: Hawaii requires written agency disclosure to consumers before any substantive interaction. Form RR105C (or current equivalent) explains the consumer\'s options (representation by seller\'s agent, buyer\'s agent, dual agent, customer status).',
    ],
    concepts: [
      { term: 'HRS 467', body: 'Hawaii Real Estate Brokers and Salespersons statute.' },
      { term: 'HAR Title 16 Chapter 99', body: 'Real Estate Commission administrative rules.' },
      { term: 'Salesperson license', body: '18+, 60-hour course, PSI exam, sponsoring broker, fees.' },
      { term: 'Broker license', body: 'Active salesperson + 80-hour broker course + experience + broker exam.' },
      { term: 'CE: 20 hours / 2 years', body: 'Includes mandatory Core Course; balance is electives.' },
      { term: 'Trust account', body: 'Client funds in Hawaii bank, separate, identified, reconciled, records 3 years.' },
      { term: 'Commingling', body: 'Mixing personal and trust funds. Per se license violation.' },
      { term: 'Conversion', body: 'Using trust funds for own benefit. Felony in many cases.' },
      { term: 'RR105C / Mandatory Agency Disclosure', body: 'Required form delivered to consumer before substantive interaction.' },
      { term: 'Real Estate Commission (REC)', body: 'Hawaii regulator. Sets rules, investigates, disciplines. Under DCCA.' },
      { term: 'DCCA', body: 'Hawaii Department of Commerce and Consumer Affairs. Oversees REC.' },
      { term: 'Inactive license', body: 'Licensee not currently practicing. Cannot list, show, negotiate.' },
      { term: 'Discrimination (HRS 515)', body: 'Hawaii Fair Housing — adds classes beyond federal: ancestry, age, marital status, sexual orientation, gender identity, HIV, source of income.' },
      { term: 'Procuring cause', body: 'Origin of unbroken chain producing a sale. Determines commission entitlement.' },
      { term: 'Advertising rules', body: 'Must include firm name. Cannot mislead. Cannot solicit currently-listed property.' },
    ],
    practice: [
      { q: 'How many hours of pre-licensing education are required for a Hawaii salesperson license?', options: ['30', '45', '60', '90'], correctIndex: 2, explain: '60-hour Salesperson Pre-Licensing Course at REC-approved school.' },
      { q: 'Hawaii continuing education for license renewal is:', options: ['10 hours / year', '20 hours every 2 years (license cycle)', '30 hours every 2 years', '40 hours every 4 years'], correctIndex: 1, explain: '20 CE hours per biennial cycle, including mandatory Core Course.' },
      { q: 'Mixing client trust funds with broker\'s operating funds is:', options: ['Allowed if reconciled', 'Commingling — license violation', 'Conversion only', 'Allowed for under-$1,000 amounts'], correctIndex: 1, explain: 'Any mixing is commingling, regardless of amount.' },
      { q: 'Hawaii\'s real estate licensing law is found at:', options: ['HRS 514B', 'HRS 521', 'HRS 467', 'HRS 478'], correctIndex: 2, explain: 'HRS 467 governs real estate brokers and salespersons.' },
      { q: 'The Hawaii regulator overseeing real estate licensees is:', options: ['HUD', 'IRS', 'Real Estate Commission (REC) under DCCA', 'NAR'], correctIndex: 2, explain: 'REC under the Department of Commerce and Consumer Affairs.' },
      { q: 'Hawaii\'s state fair housing statute (HRS 515) ADDS protected classes beyond federal, including:', options: ['Income only', 'Sexual orientation, gender identity, marital status, HIV status, source of income, ancestry, age', 'Only race and religion', 'No additional classes'], correctIndex: 1, explain: 'HRS 515 expands federal Fair Housing to additional Hawaii-specific protected classes.' },
      { q: 'A licensee\'s required minimum age is:', options: ['16', '18', '21', '25'], correctIndex: 1, explain: '18 years old to apply for salesperson license.' },
      { q: 'A salesperson can practice while holding an "inactive" license:', options: ['Yes, with broker permission', 'No — inactive licensees cannot practice', 'Only for past clients', 'Only as a referral agent'], correctIndex: 1, explain: 'Inactive license = cannot list, show, negotiate, or be paid.' },
    ],
  },
];
