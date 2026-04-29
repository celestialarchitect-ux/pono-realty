// Original educational content covering the National (Uniform) portion of the
// PSI Hawaii Real Estate Examination. Written from the public PSI Content
// Outline + general real estate principles. Not a substitute for the official
// 60-hour pre-licensing course.

export interface KeyConcept {
  term: string;
  body: string;
  hawaiiNote?: string;
}

export interface PracticeQ {
  q: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explain: string;
}

export interface ChapterContent {
  slug: string;
  intro: string;          // 1-2 sentence hook
  overview: string[];     // paragraphs of original explanation
  concepts: KeyConcept[];
  practice: PracticeQ[];
}

export const NATIONAL_CONTENT: ChapterContent[] = [
  // ─── 1. Property Ownership ───
  {
    slug: 'property-ownership',
    intro: 'Real estate licensing starts with knowing exactly what is being bought, sold, or leased — and what rights come with it.',
    overview: [
      'Real property is land, anything permanently attached to it, and the rights that flow from ownership. Personal property (chattels) is everything else — movable, not tied to a specific parcel. The line between the two often comes down to fixtures: items installed in a way that makes them part of the real property. Courts apply the MARIA test (Method of attachment, Adaptability to the property, Relationship of the parties, Intent, Agreement) to settle disputes.',
      'Ownership is best understood as a "bundle of rights" — possession, use, enjoyment, exclusion, and disposition. Different forms of ownership distribute that bundle differently. A fee simple absolute holds the whole bundle indefinitely. A life estate holds it only for a measuring life. A leasehold transfers possession and use to a tenant for a term, but the underlying fee stays with the landlord.',
      'Encumbrances are non-possessory claims that ride along with the title. Liens (mortgages, tax liens, mechanic\'s liens) attach as security for debt. Easements give someone the right to cross or use the land. Encroachments are unintended physical intrusions — a neighbor\'s fence over the line. Each affects market value and disclosure obligations.',
      'Co-ownership matters because it determines what happens at death and divorce. Joint tenancy carries the right of survivorship — when one tenant dies, their share automatically passes to the survivors. Tenancy in common divides ownership into separate, inheritable shares. Tenancy by the entirety (where recognized) is reserved for spouses with built-in survivorship and creditor protection.',
    ],
    concepts: [
      { term: 'Real property', body: 'Land, the airspace above it, the minerals below, and anything permanently attached.' },
      { term: 'Personal property (chattel)', body: 'Movable items not affixed to the land. Trade fixtures stay personal even if installed.' },
      { term: 'Fixture', body: 'A formerly-personal item that has become real property by attachment, adaptation, or intent.' },
      { term: 'Bundle of rights', body: 'The set of legal rights of ownership: possess, use, enjoy, exclude, dispose.' },
      { term: 'Fee simple absolute', body: 'The greatest possible ownership interest — perpetual, inheritable, no conditions.' },
      { term: 'Life estate', body: 'Ownership for the duration of a measuring life. Reverts to the remainderman at death.' },
      { term: 'Leasehold estate', body: 'Tenant\'s right to possess and use property for a defined term. Four types: estate for years, periodic, at will, at sufferance.' },
      { term: 'Joint tenancy', body: 'Co-ownership with right of survivorship. Requires four unities: time, title, interest, possession.' },
      { term: 'Tenancy in common', body: 'Co-ownership with separate, inheritable, often unequal shares. No survivorship.' },
      { term: 'Lien', body: 'Monetary encumbrance attaching to property as security for debt. Priority generally follows recording date, except tax liens.' },
      { term: 'Easement', body: 'Right to use another\'s land for a specific purpose. Appurtenant runs with the land; in gross is personal.' },
      { term: 'Encroachment', body: 'Unauthorized physical intrusion onto another\'s property. Usually discovered by survey.' },
      { term: 'Common interest property', body: 'Ownership where individual units coexist with shared common elements (condos, co-ops, PUDs).' },
      { term: 'Bundle of rights metaphor', body: 'Each "stick" can be sold or leased independently — mineral rights, air rights, easements, etc.' },
    ],
    practice: [
      { q: 'A built-in dishwasher most likely qualifies as:', options: ['Personal property', 'A trade fixture', 'A real-property fixture', 'An emblement'], correctIndex: 2, explain: 'Built-in appliances are typically fixtures — affixed in a way that signals intent to stay with the property.' },
      { q: 'Which co-ownership carries automatic right of survivorship?', options: ['Tenancy in common', 'Joint tenancy', 'Severalty', 'Tenancy at will'], correctIndex: 1, explain: 'Joint tenancy includes the right of survivorship; tenancy in common does not.' },
      { q: 'The greatest possible interest in real property is:', options: ['Life estate', 'Estate for years', 'Fee simple absolute', 'Determinable fee'], correctIndex: 2, explain: 'Fee simple absolute is unlimited in duration with no conditions.' },
      { q: 'A neighbor\'s fence built one foot over your boundary line is:', options: ['An easement', 'An encroachment', 'A license', 'A lien'], correctIndex: 1, explain: 'Encroachment = unauthorized physical intrusion onto another\'s property.' },
      { q: 'Which of the following is NOT a "stick" in the bundle of rights?', options: ['Right to possess', 'Right to exclude', 'Right to depreciate', 'Right to dispose'], correctIndex: 2, explain: 'Depreciation is a tax/accounting concept, not an ownership right.' },
      { q: 'A life estate measured by the life of someone other than the holder is:', options: ['Pur autre vie', 'Reversionary', 'Determinable', 'Defeasible'], correctIndex: 0, explain: 'Pur autre vie = "for another\'s life."' },
    ],
  },

  // ─── 2. Land Use Controls ───
  {
    slug: 'land-use-controls',
    intro: 'Land use is shaped by both government power and private agreements. Both restrict what an owner can do.',
    overview: [
      'Government rights in land come from four powers: taxation, eminent domain, police power, and escheat (PETE). Property taxes fund local services and create automatic liens that take priority over almost everything else. Eminent domain lets the government take private property for public use, but only with just compensation. Police power authorizes regulation for health, safety, and welfare — that\'s where zoning lives. Escheat returns property to the state when an owner dies with no heirs and no will.',
      'Zoning is the most-tested police-power application. Master plans set long-term land-use vision; zoning ordinances translate that vision into rules: residential vs commercial vs industrial vs agricultural, density limits, setback requirements, height restrictions, parking minimums. Variances and conditional uses provide narrow escape valves. Nonconforming uses ("grandfathered") survive a zoning change but typically can\'t expand.',
      'Environmental regulation cuts across all property: contamination cleanup obligations (CERCLA at the federal level), restrictions on developing wetlands or coastal zones, lead-paint disclosure for pre-1978 housing, asbestos in older buildings, radon, mold. An agent\'s duty is to recognize "red flags" and recommend professional inspection — never to certify the absence of a problem.',
      'Private controls operate alongside public ones. Deed restrictions ("conditions" or "covenants") run with the land and bind future owners. CC&Rs (Covenants, Conditions & Restrictions) typical in subdivisions and PUDs govern architectural style, paint colors, fence types, and more. HOA rules layer on top, enforced through liens and fines.',
    ],
    concepts: [
      { term: 'Police power', body: 'Government authority to regulate for health, safety, welfare. Source of zoning, building codes, environmental rules.' },
      { term: 'Eminent domain', body: 'Government power to take private property for public use with just compensation.' },
      { term: 'Escheat', body: 'Property reverts to the state when owner dies intestate with no heirs.' },
      { term: 'Master plan', body: 'Long-term land-use vision document; zoning is the implementation tool.' },
      { term: 'Zoning ordinance', body: 'Law dividing land into use districts (R, C, I, A) with density and dimensional rules.' },
      { term: 'Variance', body: 'Narrow exception to zoning for unique hardship. Does NOT change the underlying zoning.' },
      { term: 'Conditional use permit', body: 'Permission for a use allowed in the zone subject to conditions.' },
      { term: 'Nonconforming use', body: 'Pre-existing use that violates current zoning but is grandfathered. Cannot generally expand.' },
      { term: 'CC&Rs', body: 'Covenants, Conditions & Restrictions — private deed-based rules running with land.' },
      { term: 'CERCLA / Superfund', body: 'Federal law imposing strict liability for hazardous-waste cleanup on owners and operators.' },
      { term: 'Spot zoning', body: 'Singling out one parcel for different treatment; generally unconstitutional.' },
      { term: 'Setback', body: 'Required distance between a structure and a property line.' },
    ],
    practice: [
      { q: 'A homeowner builds a deck violating setback rules. The proper remedy to allow it is to apply for a:', options: ['Conditional use', 'Variance', 'Rezoning', 'Special exception'], correctIndex: 1, explain: 'A variance addresses unique hardship under existing zoning; a rezoning would change the zone itself.' },
      { q: 'Eminent domain requires:', options: ['Owner consent', 'Public use + just compensation', 'A vote of property owners', 'Federal approval'], correctIndex: 1, explain: 'Fifth Amendment requires public use + just compensation.' },
      { q: 'A use that pre-dates current zoning and continues to operate is:', options: ['Variance', 'Nonconforming use', 'Conditional use', 'Spot zoning'], correctIndex: 1, explain: 'Pre-existing uses are grandfathered as nonconforming uses.' },
      { q: 'CERCLA imposes liability for cleanup on:', options: ['Only the original polluter', 'Current owner only', 'A broad class including current and prior owners and operators', 'Only the federal government'], correctIndex: 2, explain: 'CERCLA imposes strict, joint and several liability across owners, operators, transporters, and generators.' },
      { q: 'Property taxes typically take priority over:', options: ['Earlier-recorded mortgages', 'Mechanic\'s liens', 'Federal tax liens', 'All of the above'], correctIndex: 3, explain: 'Property tax liens generally take priority regardless of recording order.' },
    ],
  },

  // ─── 3. Valuation & Market Analysis ───
  {
    slug: 'valuation-market-analysis',
    intro: 'Pricing is where every transaction starts and ends. Understand the three approaches to value and you can defend any number.',
    overview: [
      'Market value is the most probable price a willing, informed buyer would pay a willing, informed seller in an arm\'s-length transaction with reasonable exposure. Market price is what actually changed hands — it can differ from market value when the parties are pressured, related, or uninformed. Cost is what was spent to build, which has no necessary relationship to either.',
      'The four characteristics of value, called DUST: Demand, Utility, Scarcity, Transferability. Remove any one and value collapses. Principles like substitution (a buyer won\'t pay more than the cost of an equally desirable alternative), highest and best use, conformity, and progression/regression all flow from how DUST plays out in a specific market.',
      'Three approaches converge on a credible value. Sales comparison (the dominant approach for residential) adjusts recent comparable sales for differences. Cost approach (best for new construction or special-use property) sums land value plus depreciated improvement cost. Income approach (commercial / investment) capitalizes net operating income at a market cap rate (Value = NOI / Cap Rate). The appraiser reconciles the three into a single opinion.',
      'A CMA (Competitive Market Analysis) is what an agent prepares — a market-derived pricing recommendation, not an appraisal. A BOV (Broker Opinion of Value) is similar but more formal. Only a state-licensed appraiser may produce an "appraisal" for federally related transactions. Confusing these is a top exam trap.',
    ],
    concepts: [
      { term: 'Market value', body: 'Most probable price under arm\'s-length conditions with reasonable exposure.' },
      { term: 'Market price', body: 'Actual sale price. May differ from market value due to pressure or relationships.' },
      { term: 'DUST', body: 'Demand, Utility, Scarcity, Transferability — the four characteristics required for value.' },
      { term: 'Substitution', body: 'A buyer will pay no more than the cost of an equally desirable substitute.' },
      { term: 'Highest and best use', body: 'The legally permissible, physically possible, financially feasible, maximally productive use.' },
      { term: 'Sales comparison approach', body: 'Adjust comparable sales for differences. Primary for residential.' },
      { term: 'Cost approach', body: 'Land value + depreciated cost of improvements. Best for new or unique property.' },
      { term: 'Income approach', body: 'Value = NOI ÷ Capitalization Rate. Used for income-producing property.' },
      { term: 'Capitalization rate (cap rate)', body: 'NOI ÷ Value. Higher cap rate = higher risk or lower price.' },
      { term: 'Gross Rent Multiplier (GRM)', body: 'Sale Price ÷ Monthly Gross Rent. Quick screen for residential rental.' },
      { term: 'Gross Income Multiplier (GIM)', body: 'Sale Price ÷ Annual Gross Income. Used for larger income property.' },
      { term: 'Depreciation (appraisal)', body: 'Loss in value from physical, functional, or external causes. Curable or incurable.' },
      { term: 'Functional obsolescence', body: 'Outdated design or features (e.g. one bath in a 4-bedroom house).' },
      { term: 'External obsolescence', body: 'Loss caused by factors outside the property (e.g. new freeway). Almost always incurable.' },
      { term: 'Reconciliation', body: 'Appraiser\'s weighted synthesis of the three approaches into a final value.' },
      { term: 'CMA', body: 'Competitive Market Analysis — agent-prepared pricing tool, not an appraisal.' },
    ],
    practice: [
      { q: 'A four-plex generates $48,000 NOI. A market cap rate of 8% suggests a value of:', options: ['$384,000', '$600,000', '$480,000', '$750,000'], correctIndex: 1, explain: 'Value = NOI ÷ Cap Rate = 48,000 ÷ 0.08 = $600,000.' },
      { q: 'A house with one bathroom on a street where every other home has two suffers from:', options: ['Physical depreciation', 'Functional obsolescence', 'External obsolescence', 'Economic obsolescence'], correctIndex: 1, explain: 'Functional = outdated design within the property itself.' },
      { q: 'GRM is calculated as:', options: ['Annual rent ÷ price', 'Price ÷ monthly rent', 'NOI ÷ price', 'Price ÷ annual rent'], correctIndex: 1, explain: 'Gross Rent Multiplier = Sale Price ÷ Monthly Gross Rent.' },
      { q: 'Which approach is primary for valuing a single-family residence?', options: ['Cost', 'Income', 'Sales comparison', 'Reproduction'], correctIndex: 2, explain: 'Sales comparison is dominant for residential where comparables are abundant.' },
      { q: 'DUST stands for:', options: ['Demand, Utility, Scarcity, Transferability', 'Demand, Use, Sale, Title', 'Density, Utility, Setback, Transfer', 'Distance, Use, Survey, Title'], correctIndex: 0, explain: 'DUST = the four characteristics required for value.' },
      { q: 'A new highway being built next to a quiet neighborhood causes:', options: ['Curable physical depreciation', 'Functional obsolescence', 'External obsolescence', 'Reproduction loss'], correctIndex: 2, explain: 'External (economic) obsolescence is caused by factors outside the property.' },
    ],
  },

  // ─── 4. Financing ───
  {
    slug: 'financing',
    intro: 'Most transactions live or die on financing. Know the loan types, the disclosures, and the math.',
    overview: [
      'A mortgage transaction has two documents: the note (the borrower\'s promise to pay) and the security instrument (mortgage or deed of trust) that gives the lender a security interest in the property. Lien-theory states treat the mortgage as a lien on title; title-theory states treat it as a transfer of legal title to the lender until repaid. Either way, default lets the lender foreclose.',
      'Loan types differ by how principal and interest are repaid. A term (straight) loan pays interest only with a balloon at the end. An amortized loan pays principal and interest in level installments — most residential mortgages. A partially amortized loan combines installments with a balloon. An ARM (adjustable rate) ties the rate to an index plus margin, with caps. Reverse mortgages let seniors convert equity into payments, secured by the home.',
      'Insurance and government programs reduce lender risk and expand access. PMI (Private Mortgage Insurance) is required when LTV exceeds 80% on conventional loans. FHA insures loans for low-down-payment borrowers; VA guarantees loans for veterans with no PMI and often no down payment. USDA serves rural areas. Each program has limits and qualification rules tested heavily.',
      'Federal disclosure laws form a tight web. RESPA (Real Estate Settlement Procedures Act) requires the Loan Estimate within 3 business days and the Closing Disclosure 3 business days before closing. Truth in Lending discloses the APR. ECOA (Equal Credit Opportunity Act) bans lending discrimination. Predatory lending laws restrict high-cost loans. Trust-fund handling, kickbacks, and unearned fees all create license-law risk.',
    ],
    concepts: [
      { term: 'Note', body: 'Borrower\'s personal promise to repay. Without it, no debt exists.' },
      { term: 'Mortgage', body: 'Security instrument creating lender\'s lien on the property as collateral for the note.' },
      { term: 'Deed of trust', body: 'Three-party security instrument used in some states: borrower, lender, neutral trustee.' },
      { term: 'Lien theory vs title theory', body: 'Lien-theory states: borrower keeps title, lender gets lien. Title-theory: lender holds title until paid.' },
      { term: 'LTV (Loan-to-Value)', body: 'Loan ÷ property value. PMI required above 80% LTV on conventional loans.' },
      { term: 'Discount points', body: 'Prepaid interest. 1 point = 1% of loan amount. Lowers rate.' },
      { term: 'PMI', body: 'Private Mortgage Insurance. Protects lender on high-LTV conventional loans.' },
      { term: 'FHA', body: 'Federal Housing Administration. Insures low-down-payment loans.' },
      { term: 'VA loan', body: 'Veterans Affairs guaranteed loan. No PMI, often no down payment for eligible vets.' },
      { term: 'Acceleration clause', body: 'On default, lender can demand entire balance immediately.' },
      { term: 'Due-on-sale clause', body: 'Lender can call the loan if property is sold without consent.' },
      { term: 'Prepayment penalty', body: 'Fee for paying off loan early. Restricted on most owner-occupied mortgages.' },
      { term: 'RESPA', body: 'Real Estate Settlement Procedures Act. Loan Estimate within 3 days; Closing Disclosure 3 days before closing.' },
      { term: 'Truth in Lending Act / Reg Z', body: 'Requires APR disclosure and standardized loan cost format.' },
      { term: 'ECOA', body: 'Equal Credit Opportunity Act. Bans lending discrimination on protected bases.' },
      { term: 'Primary mortgage market', body: 'Direct lenders making loans to consumers.' },
      { term: 'Secondary mortgage market', body: 'Investors buying loans from primary lenders (Fannie Mae, Freddie Mac, Ginnie Mae).' },
      { term: 'Subordination', body: 'Voluntary lowering of a lien\'s priority to allow a new senior lien.' },
    ],
    practice: [
      { q: 'A buyer pays $300,000 with a $240,000 loan. The LTV is:', options: ['60%', '70%', '80%', '90%'], correctIndex: 2, explain: '$240,000 ÷ $300,000 = 80%. PMI is generally required ABOVE 80%.' },
      { q: 'One discount point on a $200,000 loan equals:', options: ['$200', '$2,000', '$20,000', '$1,000'], correctIndex: 1, explain: '1 point = 1% of loan = $2,000.' },
      { q: 'Which clause lets a lender demand full payment on default?', options: ['Defeasance', 'Alienation', 'Acceleration', 'Subordination'], correctIndex: 2, explain: 'Acceleration triggers full immediate balance.' },
      { q: 'The Closing Disclosure must be delivered:', options: ['At closing', '3 business days before closing', '7 days before closing', 'On loan application'], correctIndex: 1, explain: 'TRID requires CD 3 business days before consummation.' },
      { q: 'Fannie Mae operates in the:', options: ['Primary mortgage market', 'Secondary mortgage market', 'FHA market', 'VA market'], correctIndex: 1, explain: 'Fannie Mae and Freddie Mac purchase loans from primary lenders.' },
      { q: 'A loan with level monthly payments that pays off the balance entirely is:', options: ['Term loan', 'Amortized', 'Balloon', 'Interest only'], correctIndex: 1, explain: 'Fully amortized = level payments retiring principal and interest by maturity.' },
    ],
  },

  // ─── 5. Laws of Agency ───
  {
    slug: 'laws-of-agency',
    intro: 'Agency law governs every relationship between licensee and client. The exam tests it heavily; clients live or die by it.',
    overview: [
      'Agency is a legal relationship where one person (agent) acts on behalf of another (principal/client). Real estate agents owe fiduciary duties to clients but lower duties to customers. Memorize the acronym COALD: Care, Obedience (to lawful instructions), Accounting, Loyalty, Disclosure. Care + skill, undivided loyalty, full disclosure of all material facts, accounting for funds, and obedience are the bedrock.',
      'Agency types: Special agent (limited authority for one transaction — typical real estate), General agent (broader continuing authority — property manager), Universal agent (everything legal — power of attorney). Subagency exists when an agent\'s authority is delegated to another. Designated agency lets one broker assign different agents from the same firm to opposite sides of a deal.',
      'Dual agency occurs when one agent or firm represents both buyer and seller. It\'s legal in most states only with written consent from both parties, and it eliminates undivided loyalty — the agent must act neutrally. Many states require enhanced disclosure forms. Hawaii recognizes dual agency under HRS 467 with written consent. Misuse of dual agency is one of the top causes of license revocation.',
      'Agency creates duties to non-clients (customers and third parties) too — primarily honesty, fair dealing, and disclosure of known material defects. An agent can never misrepresent a fact, regardless of who they represent. Agency terminates by mutual agreement, expiration, completion of purpose, breach, destruction of property, death, bankruptcy, or operation of law.',
    ],
    concepts: [
      { term: 'Agent', body: 'A person authorized to act for and on behalf of a principal.' },
      { term: 'Principal / client', body: 'The party the agent owes fiduciary duties to.' },
      { term: 'Customer', body: 'Third party in transaction not represented by the agent. Owed honesty + material-fact disclosure.' },
      { term: 'Fiduciary duties (COALD)', body: 'Care, Obedience, Accounting, Loyalty, Disclosure.' },
      { term: 'Special agent', body: 'Limited authority for one transaction — typical listing broker.' },
      { term: 'General agent', body: 'Broader, continuing authority — typical property manager.' },
      { term: 'Universal agent', body: 'Authority to act in all matters — power of attorney.' },
      { term: 'Subagency', body: 'Agent\'s authority delegated to another agent.' },
      { term: 'Designated agency', body: 'Within one brokerage, different agents represent opposite sides.' },
      { term: 'Dual agency', body: 'One agent or firm represents both sides. Requires written informed consent. Eliminates undivided loyalty.' },
      { term: 'Buyer agency', body: 'Agent represents buyer\'s interests exclusively.' },
      { term: 'Listing agreement', body: 'Contract creating seller-agent relationship.' },
      { term: 'Express agency', body: 'Created by written or oral agreement.' },
      { term: 'Implied agency', body: 'Created by parties\' conduct.' },
      { term: 'Termination by operation of law', body: 'Death, incompetency, bankruptcy, destruction of subject matter, or change in law.' },
    ],
    practice: [
      { q: 'COALD stands for:', options: ['Confidence, Obedience, Accuracy, Loyalty, Diligence', 'Care, Obedience, Accounting, Loyalty, Disclosure', 'Conduct, Order, Authority, Liability, Documentation', 'Communication, Obligation, Audit, Loyalty, Disclosure'], correctIndex: 1, explain: 'COALD = the five fiduciary duties.' },
      { q: 'A property manager is most typically a:', options: ['Special agent', 'General agent', 'Universal agent', 'Subagent'], correctIndex: 1, explain: 'Property managers have broad continuing authority — general agency.' },
      { q: 'Dual agency requires:', options: ['Verbal consent from one party', 'Written informed consent from both parties', 'No consent', 'Written consent from buyer only'], correctIndex: 1, explain: 'Both parties must give written informed consent.' },
      { q: 'The agent\'s duty to a non-represented customer includes:', options: ['Loyalty', 'Honesty and material-fact disclosure', 'Confidentiality', 'Negotiation on their behalf'], correctIndex: 1, explain: 'Agents owe honesty and disclosure of known material defects to all parties.' },
      { q: 'Agency by operation of law terminates upon:', options: ['Property destruction', 'Death of the principal', 'Bankruptcy of the agent', 'All of the above'], correctIndex: 3, explain: 'All three end agency without further action.' },
      { q: 'Which is NOT a fiduciary duty?', options: ['Loyalty', 'Disclosure to customers', 'Care', 'Obedience'], correctIndex: 1, explain: 'Fiduciary duties are owed to the client, not the customer.' },
    ],
  },

  // ─── 6. Mandated Disclosures ───
  {
    slug: 'mandated-disclosures',
    intro: 'Disclosure failures create more lawsuits than any other licensee mistake. When in doubt — disclose.',
    overview: [
      'Sellers in nearly every state must disclose known material defects in writing. The agent\'s role is to facilitate accurate disclosure, not to certify the property\'s condition. If the agent has actual knowledge of a defect — water in the basement, an undisclosed addition — the agent must disclose it independently, even if the seller doesn\'t. Misrepresentation by silence is just as actionable as a lie.',
      'Federal law mandates a lead-based paint disclosure (the "Lead Pamphlet" plus the disclosure form) for housing built before 1978. Buyers get a 10-day right to inspect. Failure to disclose is a per-violation federal penalty. Asbestos, radon, mold, formaldehyde, underground storage tanks, and electromagnetic fields are increasingly disclosed via state-specific forms.',
      'Material facts include anything that could affect a reasonable buyer\'s decision: known defects, boundary disputes, pending litigation, planned road construction, sex-offender notifications (Megan\'s Law), past flooding, prior fires, prior deaths or stigmatizing events (varies by state). The exam tests "would a reasonable buyer want to know this?" — if yes, it\'s material.',
      'An agent who relays a seller\'s statement is generally not liable, unless the agent knew or should have known the statement was false. "Puffing" (subjective opinion: "this is a great kitchen!") is allowed; misstatement of fact ("the roof is brand new") is not. The line between the two is a frequent exam question.',
    ],
    concepts: [
      { term: 'Material fact', body: 'A fact a reasonable buyer or seller would consider important in deciding whether and at what price to transact.' },
      { term: 'Misrepresentation', body: 'False statement of material fact. Can be innocent, negligent, or fraudulent.' },
      { term: 'Misrepresentation by silence', body: 'Failure to disclose a known material fact. Actionable as fraud.' },
      { term: 'Puffing', body: 'Subjective sales talk ("this is the best house in the neighborhood"). Not actionable.' },
      { term: 'Lead-Based Paint Disclosure', body: 'Federal law requires for pre-1978 housing. Buyer gets 10-day inspection window + EPA pamphlet.' },
      { term: 'Megan\'s Law', body: 'Sex offender registration disclosure. State rules vary on agent duty.' },
      { term: 'Stigmatized property', body: 'Property with non-physical issue (death, crime). State rules vary on disclosure.' },
      { term: 'Caveat emptor', body: '"Let the buyer beware." Largely supplanted by mandatory disclosure laws.' },
      { term: 'Latent defect', body: 'Hidden defect not discoverable on reasonable inspection. Must be disclosed if known.' },
      { term: 'Patent defect', body: 'Obvious defect visible on reasonable inspection.' },
      { term: 'Red flag', body: 'A condition that should prompt the agent to inquire and recommend professional inspection.' },
      { term: 'As-is sale', body: 'Buyer takes the property in its current condition. Does NOT eliminate disclosure obligations.' },
    ],
    practice: [
      { q: 'A licensee learns the basement floods every winter. The seller insists on not disclosing. The agent must:', options: ['Honor seller wishes', 'Disclose to buyers anyway', 'Resign the listing only', 'Disclose only if asked'], correctIndex: 1, explain: 'Agent has independent duty to disclose known material defects.' },
      { q: 'Lead-based paint disclosure applies to housing built before:', options: ['1965', '1972', '1978', '1986'], correctIndex: 2, explain: 'Pre-1978 residential housing.' },
      { q: '"This house has the best view on the street" is most likely:', options: ['Misrepresentation', 'Puffing', 'Fraud', 'A material fact'], correctIndex: 1, explain: 'Subjective opinion = puffing, allowed.' },
      { q: 'A defect not visible on reasonable inspection is:', options: ['Patent', 'Latent', 'Cosmetic', 'Functional'], correctIndex: 1, explain: 'Latent defects are hidden; agents must disclose if known.' },
      { q: 'An "as-is" clause:', options: ['Eliminates seller disclosure duty', 'Eliminates agent disclosure duty', 'Does NOT eliminate disclosure of known material defects', 'Bars all buyer claims'], correctIndex: 2, explain: 'As-is does not override disclosure laws.' },
    ],
  },

  // ─── 7. Contracts ───
  {
    slug: 'contracts',
    intro: 'Real estate transactions are governed by contract from offer to closing. Know what makes a contract valid and what voids it.',
    overview: [
      'A valid contract requires four elements: mutual agreement (offer + acceptance), consideration, legal capacity, and lawful purpose. Real estate contracts must additionally be in writing under the Statute of Frauds — verbal agreements to transfer land are unenforceable. An offer becomes a contract only when acceptance is communicated; until then, the offeror can revoke.',
      'Listing agreements come in three flavors. Exclusive Right to Sell — broker earns commission no matter who finds the buyer. Exclusive Agency — broker earns unless the seller finds the buyer. Open Listing — broker earns only if their efforts produced the sale. Net listings (broker keeps everything above a stated price) are discouraged or banned in most states because of conflict of interest.',
      'Purchase agreements bind buyer and seller. Common contingencies (escape clauses) include financing, inspection, appraisal, sale of buyer\'s current home, and title. A contingency must be satisfied or waived by its deadline; otherwise the contract terminates with the deposit returned. "Time is of the essence" makes deadlines strict — a day late kills the contract.',
      'A breach gives the non-breaching party remedies: specific performance (court orders the actual conveyance — typical for buyers, since real estate is unique), monetary damages (lost profits, costs), liquidated damages (pre-agreed amount, usually the earnest money), or rescission (cancel + restore parties to original position). Mutual rescission ends a contract by agreement; novation substitutes a new party or new terms with everyone\'s consent.',
    ],
    concepts: [
      { term: 'Statute of Frauds', body: 'Real estate contracts must be in writing to be enforceable.' },
      { term: 'Offer', body: 'Definite proposal communicated with intent to be bound on acceptance.' },
      { term: 'Acceptance', body: 'Unconditional agreement to all material terms. Communication is required.' },
      { term: 'Counteroffer', body: 'Rejection + new offer. Cancels the original offer.' },
      { term: 'Consideration', body: 'Something of value exchanged. Money is most common.' },
      { term: 'Capacity', body: 'Legal ability to contract. Minors and incompetents have limited capacity.' },
      { term: 'Exclusive Right to Sell', body: 'Broker earns commission regardless of who produces the buyer.' },
      { term: 'Exclusive Agency', body: 'Broker earns unless seller finds the buyer.' },
      { term: 'Open Listing', body: 'Broker earns only if their efforts cause the sale. Multiple brokers possible.' },
      { term: 'Net Listing', body: 'Broker keeps amount above seller\'s stated minimum. Disfavored or illegal.' },
      { term: 'Earnest money', body: 'Buyer\'s good-faith deposit, typically held in trust by escrow or broker.' },
      { term: 'Contingency', body: 'Condition that must be met for the contract to proceed.' },
      { term: 'Specific performance', body: 'Court orders actual conveyance. Common remedy for breach by seller.' },
      { term: 'Liquidated damages', body: 'Pre-agreed damages amount, usually the earnest money.' },
      { term: 'Rescission', body: 'Termination of contract returning parties to pre-contract position.' },
      { term: 'Novation', body: 'Substitution of a new party or new contract by mutual agreement.' },
      { term: 'Time is of the essence', body: 'Deadlines are strict. Late performance = breach.' },
      { term: 'Option contract', body: 'Right (not obligation) to buy at a stated price within a stated time. Optionee pays consideration.' },
    ],
    practice: [
      { q: 'A buyer\'s offer is accepted by the seller\'s verbal "OK." Is there a contract?', options: ['Yes', 'No — Statute of Frauds requires writing', 'Yes if witnessed', 'Yes if earnest money posted'], correctIndex: 1, explain: 'Real estate contracts must be in writing to be enforceable.' },
      { q: 'In an exclusive-agency listing, the seller pays the broker:', options: ['Always', 'Only if seller produces buyer', 'Unless seller produces the buyer', 'Never'], correctIndex: 2, explain: 'Exclusive agency = broker earns UNLESS the seller themselves found the buyer.' },
      { q: 'A counteroffer:', options: ['Locks in the original price', 'Cancels the original offer', 'Must be accepted', 'Voids the listing'], correctIndex: 1, explain: 'A counteroffer rejects + replaces the original offer.' },
      { q: 'Specific performance is most often sought by:', options: ['Listing brokers', 'Buyers', 'Lenders', 'Insurers'], correctIndex: 1, explain: 'Buyers can compel conveyance because real estate is unique.' },
      { q: 'Time is of the essence means:', options: ['Negotiations should be fast', 'Deadlines are strictly enforced', 'Closing must be within 30 days', 'The seller controls timing'], correctIndex: 1, explain: 'Strict performance is required by the deadline.' },
      { q: 'Net listings are:', options: ['Required by law', 'Encouraged by NAR', 'Disfavored or prohibited in most states', 'Most common for new construction'], correctIndex: 2, explain: 'Net listings create conflict-of-interest risk.' },
    ],
  },

  // ─── 8. Transfer of Title ───
  {
    slug: 'transfer-of-title',
    intro: 'Title transfers happen at closing. Master the deed types, recording, and escrow.',
    overview: [
      'A deed is the document that transfers title. To be valid, it requires: competent grantor, identifiable grantee, consideration recital, words of conveyance ("grant," "sell"), legal description, signature of grantor, delivery, and acceptance. Notarization isn\'t required for validity but is required for recording. Recording protects the grantee\'s interest against later claims by giving constructive notice.',
      'Deed types differ in warranties. General warranty deed offers the strongest protection — grantor warrants against all defects of title back to the property\'s origin. Special (limited) warranty deed warrants only against defects arising during grantor\'s ownership. Bargain and sale deed implies grantor has title but offers no express warranties. Quitclaim deed conveys whatever interest the grantor has, with zero warranty — common for clearing title clouds.',
      'At death, title passes by will (testate) or by state intestate succession statute (intestate). Probate court oversees the transfer. A life estate ends at the measuring life\'s death and reverts or remains. Joint tenancy property passes by survivorship outside probate.',
      'Closing combines the buyer\'s funds, the loan proceeds, and the deed into a single coordinated transfer. Escrow agent holds funds and documents and disburses on satisfaction of all conditions. Closing statements (modern: Closing Disclosure) detail every credit and debit. Prorations split items like taxes, rent, and HOA dues at the closing date.',
    ],
    concepts: [
      { term: 'Deed', body: 'Document transferring title from grantor to grantee.' },
      { term: 'Grantor / Grantee', body: 'Grantor = transferor. Grantee = recipient.' },
      { term: 'Words of conveyance', body: '"Grant, sell, convey..." — required to make a deed effective.' },
      { term: 'Habendum clause', body: '"To have and to hold" — defines extent of estate granted.' },
      { term: 'Acknowledgment', body: 'Notarized statement required for recording, not for validity.' },
      { term: 'Delivery and acceptance', body: 'Deed must be delivered with intent to convey; grantee must accept. No transfer until both occur.' },
      { term: 'General warranty deed', body: 'Strongest deed. Warranties run back to property\'s origin.' },
      { term: 'Special warranty deed', body: 'Warrants only against defects arising during grantor\'s ownership.' },
      { term: 'Quitclaim deed', body: 'Conveys whatever interest grantor has; no warranties. Used to clear title clouds.' },
      { term: 'Recording', body: 'Filing the deed with the county recorder. Provides constructive notice.' },
      { term: 'Constructive notice', body: 'Legal presumption everyone is on notice of recorded documents.' },
      { term: 'Title insurance', body: 'Protects against title defects existing at closing. Owner\'s policy + lender\'s policy.' },
      { term: 'Chain of title', body: 'Recorded history of ownership. Gaps create "clouds."' },
      { term: 'Cloud on title', body: 'Defect or unresolved claim affecting marketability.' },
      { term: 'Suit to quiet title', body: 'Court action to resolve clouds and confirm ownership.' },
      { term: 'Probate', body: 'Court process administering a deceased person\'s estate.' },
      { term: 'Testate / intestate', body: 'Testate = died with valid will. Intestate = without one.' },
      { term: 'Escrow agent', body: 'Neutral third party holding funds + documents and disbursing per instructions.' },
    ],
    practice: [
      { q: 'Which deed offers the most protection to the buyer?', options: ['Quitclaim', 'Bargain and sale', 'Special warranty', 'General warranty'], correctIndex: 3, explain: 'General warranty deed warrants the entire chain of title.' },
      { q: 'A quitclaim deed:', options: ['Guarantees clear title', 'Conveys whatever interest the grantor has, with no warranty', 'Is used only for first-time conveyances', 'Cannot be recorded'], correctIndex: 1, explain: 'Quitclaim is "as-is" with no warranties.' },
      { q: 'For a deed to be valid, it must be:', options: ['Recorded', 'Notarized', 'Delivered and accepted', 'In a court order'], correctIndex: 2, explain: 'Delivery + acceptance is essential. Recording protects but isn\'t required for validity.' },
      { q: 'A person dies without a will. Their property passes by:', options: ['Operation of law via intestate succession', 'Quitclaim deed', 'Public auction', 'Eminent domain'], correctIndex: 0, explain: 'Intestate succession statutes determine heirs.' },
      { q: 'Recording a deed provides:', options: ['Actual notice', 'Constructive notice', 'Inquiry notice', 'No notice'], correctIndex: 1, explain: 'Recording = constructive notice to all subsequent parties.' },
    ],
  },

  // ─── 9. Practice of Real Estate ───
  {
    slug: 'practice-of-real-estate',
    intro: 'How licensees actually operate — trust funds, fair housing, ads, supervision, antitrust. License-revocation territory.',
    overview: [
      'Trust accounts hold other people\'s money — earnest money deposits, security deposits, rents collected. Commingling personal and trust funds is a license-law violation in every state. So is conversion (using trust funds for the broker\'s own benefit). Trust accounts must be properly identified, reconciled regularly, and held at a state-approved institution. Records typically must be retained 3-7 years.',
      'Federal Fair Housing Act (1968) prohibits discrimination in housing based on race, color, national origin, religion, sex, familial status, and disability. Hawaii adds protected classes including ancestry, age, marital status, sexual orientation, gender identity, HIV status, and source of income (HRS 515). Steering, blockbusting, and redlining are textbook violations. Advertising must avoid words or imagery suggesting preference for any protected class.',
      'Advertising rules: identify the firm by name, distinguish "agent" from "broker," avoid misleading claims, never falsely advertise as the listing broker, never solicit listings already under contract with another broker. "Truth in advertising" applies to internet, MLS, social media, and print equally.',
      'Brokers supervise agents. Failure to supervise can revoke the broker\'s license even if the agent\'s violation was unilateral. Independent-contractor status changes tax treatment but doesn\'t reduce supervisory duty. Antitrust law (Sherman Act) bans price fixing (broker collusion on commission), market allocation (geographic carve-ups), and group boycotts. "What\'s the going commission rate?" must be answered with "commissions are negotiable."',
    ],
    concepts: [
      { term: 'Trust account', body: 'Separate account holding client/customer funds. No commingling. Subject to audit.' },
      { term: 'Commingling', body: 'Mixing personal and trust funds. License-law violation everywhere.' },
      { term: 'Conversion', body: 'Using trust funds for personal benefit. Felony in many states.' },
      { term: 'Fair Housing Act (1968 + amendments)', body: 'Federal law banning discrimination in housing on 7 protected bases.' },
      { term: 'Steering', body: 'Channeling buyers to/away from neighborhoods based on protected class. Illegal.' },
      { term: 'Blockbusting', body: 'Inducing sales by representing protected-class entry. Illegal.' },
      { term: 'Redlining', body: 'Refusing to lend or insure in protected-class areas. Illegal.' },
      { term: 'Price fixing', body: 'Brokers agreeing on commission rates. Per se Sherman Act violation.' },
      { term: 'Group boycott', body: 'Brokers agreeing to refuse dealings with another firm. Illegal.' },
      { term: 'Independent contractor', body: 'Agent classified for tax purposes; broker still supervises for license law.' },
      { term: 'NAR Code of Ethics', body: 'Voluntary professional code; binding on REALTOR® members; not state law.' },
      { term: 'Procuring cause', body: 'Agent who initiated the unbroken chain leading to a sale. Determines commission entitlement.' },
      { term: 'RESPA Section 8', body: 'Bans kickbacks and unearned fees among settlement service providers.' },
    ],
    practice: [
      { q: 'Steering means:', options: ['Encouraging a buyer to use your lender', 'Channeling buyers based on protected class', 'Negotiating price', 'Offering homestaging advice'], correctIndex: 1, explain: 'Steering is a textbook fair housing violation.' },
      { q: 'A broker uses earnest money to pay office rent. This is:', options: ['Allowed if reimbursed', 'Commingling only', 'Conversion', 'Procuring cause'], correctIndex: 2, explain: 'Conversion = using trust funds for own benefit.' },
      { q: 'Two competing brokers agree to charge 6% on all listings. This is:', options: ['Price negotiation', 'A market efficiency', 'Price fixing — antitrust violation', 'Standard practice'], correctIndex: 2, explain: 'Sherman Act violation; commissions are negotiable.' },
      { q: 'Federal Fair Housing\'s 7 protected classes include:', options: ['Race, color, religion, sex, national origin, familial status, disability', 'Race only', 'Race and religion only', 'Income and credit score'], correctIndex: 0, explain: 'These are the seven federal classes; states (including Hawaii) add more.' },
      { q: 'A broker who pays an undisclosed referral fee to a settlement service provider violates:', options: ['ECOA', 'Truth in Lending', 'RESPA Section 8', 'Statute of Frauds'], correctIndex: 2, explain: 'RESPA Section 8 bans kickbacks and unearned referral fees.' },
    ],
  },

  // ─── 10. Real Estate Calculations ───
  {
    slug: 'real-estate-calculations',
    intro: 'Roughly 7-10 exam questions are math. Memorize the formulas and the scenario-types repeat.',
    overview: [
      'Areas: rectangle = L × W. Triangle = ½ × base × height. Circle = π r². Acre = 43,560 sq ft. Many exam questions test conversion between sq ft and acres.',
      'Percentages: part = whole × rate. The same equation rearranges to find any one of the three. Commission = sale price × commission rate. Split that by listing/selling broker percentages.',
      'LTV = Loan ÷ Value. Down payment = Value − Loan. Discount points = loan × point % per point. APR vs interest rate: APR includes points and certain fees, so APR > interest rate when points are charged.',
      'Prorations split shared expenses at closing. Most exams use a 360-day year (12 × 30-day months). Daily amount = annual amount ÷ 360 (or monthly ÷ 30). Whoever owned the day of closing typically pays for it (varies by jurisdiction; the exam will specify).',
      'Capitalization: Value = NOI ÷ Cap Rate. NOI = Gross Income − Vacancy/Collection Loss − Operating Expenses. Mortgage P&I is NOT an operating expense for NOI purposes.',
      'GRM = Sale Price ÷ Monthly Gross Rent. Quick screen: if comparables show GRM = 120, a property renting for $2,000 suggests a ~$240,000 value before adjustments.',
    ],
    concepts: [
      { term: 'Acre', body: '43,560 square feet.' },
      { term: 'Square foot ↔ square yard', body: '1 sq yard = 9 sq ft.' },
      { term: 'Commission formula', body: 'Sale Price × Commission Rate = Total Commission.' },
      { term: 'LTV formula', body: 'Loan ÷ Value.' },
      { term: 'NOI', body: 'Effective Gross Income − Operating Expenses (no debt service).' },
      { term: 'Cap rate formula', body: 'NOI ÷ Value. Solve for any variable.' },
      { term: 'GRM formula', body: 'Sale Price ÷ Monthly Rent (or Annual for GIM).' },
      { term: 'Proration (360-day)', body: 'Annual ÷ 360 = daily; multiply by days owed.' },
      { term: 'Discount point', body: '1% of loan amount.' },
      { term: 'Mill rate', body: 'Property tax = Assessed Value × (mills ÷ 1,000).' },
    ],
    practice: [
      { q: 'A lot is 200 ft × 250 ft. Its size in acres is approximately:', options: ['0.50', '1.00', '1.15', '2.00'], correctIndex: 2, explain: '50,000 sq ft ÷ 43,560 ≈ 1.15 acres.' },
      { q: '$320,000 sale at 6% commission, 50/50 split. Each broker receives:', options: ['$9,600', '$19,200', '$8,000', '$16,000'], correctIndex: 0, explain: 'Total $19,200 ÷ 2 = $9,600 each.' },
      { q: 'A property generates $36,000 NOI with a 9% cap rate. Estimated value:', options: ['$324,000', '$400,000', '$360,000', '$450,000'], correctIndex: 1, explain: '36,000 ÷ 0.09 = $400,000.' },
      { q: '$240,000 loan, 2 discount points, point cost is:', options: ['$240', '$2,400', '$4,800', '$24,000'], correctIndex: 2, explain: '2% × $240,000 = $4,800.' },
      { q: 'Annual taxes $3,600; closing on April 1 (using 360-day year, seller pays through closing day). Seller\'s prorated share for the year:', options: ['$300', '$600', '$900', '$1,200'], correctIndex: 2, explain: '$3,600 × 90/360 = $900 (Jan 1 – Apr 1, 90 days).' },
    ],
  },

  // ─── 11. Specialty Areas ───
  {
    slug: 'specialty-areas',
    intro: 'Property management, common-interest, subdivisions, commercial. Smaller exam weight but easy points if you know the basics.',
    overview: [
      'Property management is general agency. The PM collects rent, maintains the property, handles tenants, and remits net to the owner. Common compensation: percentage of rents collected. The PM owes fiduciary duties to the owner. Tenant-screening must comply with fair housing.',
      'Common-interest ownership: condominium (own unit + undivided interest in common elements), cooperative (own shares in corporation that owns the building, hold proprietary lease for the unit), planned unit development (PUD — own lot + common-area amenities, governed by HOA), time share (right to occupy a unit for a period each year).',
      'Subdivisions split a parcel into lots for sale or development. State subdivision laws regulate platting, dedication of streets, infrastructure requirements, and disclosures. Interstate Land Sales Full Disclosure Act (federal) covers cross-state sales of unimproved lots over a threshold.',
      'Commercial / income property analysis differs from residential: focus is income-generating ability, not comparable sales. Cap rate, NOI, debt service coverage ratio (DSCR = NOI ÷ debt service), and lease terms (gross, net, triple-net) are tested. Triple-net (NNN) lease shifts taxes, insurance, and maintenance to tenant.',
    ],
    concepts: [
      { term: 'Property manager', body: 'General agent collecting rents, maintaining property, handling tenants for owner.' },
      { term: 'Condominium', body: 'Fee ownership of unit + undivided interest in common elements.' },
      { term: 'Cooperative', body: 'Own shares of corporation that owns building + proprietary lease.' },
      { term: 'PUD', body: 'Planned Unit Development. Own individual lot + share in common areas.' },
      { term: 'Time share', body: 'Right to occupy unit for set period (often weekly) each year.' },
      { term: 'CC&Rs / HOA', body: 'Recorded covenants + association governing common-interest community.' },
      { term: 'Subdivision', body: 'Division of land into lots for sale or development.' },
      { term: 'Plat map', body: 'Recorded survey showing lots, streets, easements within a subdivision.' },
      { term: 'Gross lease', body: 'Tenant pays rent only; landlord pays operating expenses.' },
      { term: 'Net lease', body: 'Tenant pays rent + some operating expenses.' },
      { term: 'Triple-net (NNN) lease', body: 'Tenant pays rent + taxes + insurance + maintenance.' },
      { term: 'DSCR', body: 'Debt Service Coverage Ratio = NOI ÷ Annual Debt Service.' },
    ],
    practice: [
      { q: 'In a cooperative, the resident:', options: ['Owns a fee interest in the unit', 'Owns shares of the corporation + holds a proprietary lease', 'Owns the land and the building', 'Owns nothing — they are tenants'], correctIndex: 1, explain: 'Co-op = stock + lease, not fee ownership.' },
      { q: 'A triple-net lease shifts to the tenant:', options: ['Rent only', 'Rent + taxes', 'Rent + taxes + insurance + maintenance', 'No rent until breakeven'], correctIndex: 2, explain: 'NNN = three nets: taxes, insurance, maintenance.' },
      { q: 'A PUD owner typically owns:', options: ['Only their unit airspace', 'Their individual lot + undivided interest in common areas', 'Shares in a corporation', 'A leasehold'], correctIndex: 1, explain: 'PUD owners hold fee in their lot plus common-area interest.' },
      { q: 'NOI for an investment property is $80,000. Annual debt service is $50,000. DSCR is:', options: ['0.625', '1.30', '1.60', '2.00'], correctIndex: 2, explain: 'DSCR = 80,000 ÷ 50,000 = 1.60.' },
    ],
  },
];
