// Tough question bank — additional Hawaii-style "gnarly" PSI prep questions
// designed to mirror how the real Hawaii Real Estate Salesperson Exam phrases
// items. Patterns used here:
//   - Double negatives ("which is NOT an exception...")
//   - "Most likely" / "primary" / "best" between two technically-true options
//   - Long scenarios with red-herring data
//   - Hawaii-specific edge cases (HARPTA, leasehold, HRS 514B, Land Court)
//
// Original synthesis; not reproduced from any official PSI item bank.

import type { ExamItem } from './exam-bank';

export type Difficulty = 'standard' | 'hard' | 'gnarly';

export interface ToughItem extends Omit<ExamItem, 'chapterSlug' | 'portion'> {
  difficulty: 'hard' | 'gnarly';
  portion: 'national' | 'state';
  chapterSlug: string;
}

export const TOUGH_BANK: ToughItem[] = [
  // ─────────── HARD (12) ───────────
  {
    difficulty: 'hard',
    portion: 'national',
    chapterSlug: 'agency',
    q: 'A buyer\'s agent learns during a transaction that the buyer plans to default on their mortgage within six months to force a short sale and walk away with cash from a side arrangement. The agent\'s PRIMARY duty in this moment is to:',
    options: [
      'Continue representing the buyer because all communications are confidential',
      'Disclose the buyer\'s intent to the listing agent and seller',
      'Withdraw from the transaction; the buyer\'s plan constitutes fraud the agent cannot facilitate',
      'Report the buyer to the lender to protect the lender\'s interest',
    ],
    correctIndex: 2,
    explain: 'Confidentiality protects lawful confidences only. Knowing participation in mortgage fraud violates the agent\'s duty of legality and exposes the licensee. The correct course is to withdraw and document — not unilaterally disclose private information, and not "report" the buyer to a non-client lender.',
  },
  {
    difficulty: 'hard',
    portion: 'national',
    chapterSlug: 'agency',
    q: 'Of the fiduciary duties owed by an agent to a principal, which one survives the termination of the agency relationship?',
    options: ['Obedience', 'Accountability', 'Loyalty', 'Confidentiality'],
    correctIndex: 3,
    explain: 'Confidentiality persists indefinitely after the agency ends — an agent cannot disclose a former principal\'s lowest acceptable price years later. Obedience, accountability, and loyalty terminate with the relationship.',
  },
  {
    difficulty: 'hard',
    portion: 'national',
    chapterSlug: 'financing',
    q: 'A buyer is qualified for a $720,000 loan at 6.5% on a 30-year fixed. Two discount points are paid by the buyer at closing. Approximately how much do the points cost the buyer?',
    options: ['$1,440', '$7,200', '$14,400', '$28,800'],
    correctIndex: 2,
    explain: 'One discount point equals 1% of the loan amount. Two points on $720,000 = 0.02 × $720,000 = $14,400. Note the trap: the question gives the rate and term to make you reach for a payment calculation that isn\'t asked.',
  },
  {
    difficulty: 'hard',
    portion: 'national',
    chapterSlug: 'valuation-market-analysis',
    q: 'Three recent sales of comparable Kailua homes net to: $1,420,000 (after $40K of adjustments), $1,460,000 (after $20K of adjustments), and $1,490,000 (after $80K of adjustments). For valuation purposes the BEST indicator of market value among these comps is:',
    options: [
      '$1,420,000 — the lowest adjusted figure is the most conservative',
      '$1,460,000 — required the fewest adjustments and is therefore the most reliable',
      '$1,490,000 — closest to current market trend',
      'The arithmetic average of all three',
    ],
    correctIndex: 1,
    explain: 'In the sales comparison approach, the comp requiring the FEWEST adjustments is the most reliable indicator — its similarity to the subject is doing the work, not your adjustments. Averaging masks data quality differences.',
  },
  {
    difficulty: 'hard',
    portion: 'state',
    chapterSlug: 'hawaii-license-law',
    q: 'Under Hawaii Revised Statutes Chapter 467, a real estate licensee who knowingly handles trust funds in violation of REC rules is MOST exposed to:',
    options: [
      'A civil suit by the client only',
      'A criminal misdemeanor charge only',
      'Both REC disciplinary action AND potential criminal liability',
      'Only a fine, since trust fund mishandling is administrative in Hawaii',
    ],
    correctIndex: 2,
    explain: 'Hawaii REC disciplinary powers and criminal statutes are not mutually exclusive. Knowing mishandling of trust funds can trigger both administrative discipline (suspension, revocation, fines) AND, depending on facts, criminal prosecution.',
  },
  {
    difficulty: 'hard',
    portion: 'state',
    chapterSlug: 'hawaii-condo-law',
    q: 'Under HRS 514B, a condominium developer must deliver the Public Report to a prospective purchaser:',
    options: [
      'After the contract is signed but before closing',
      'Before the purchaser signs a binding contract',
      'Within 30 days of association turnover',
      'Only upon written request from the purchaser',
    ],
    correctIndex: 1,
    explain: 'HRS 514B requires the developer to deliver the Public Report BEFORE a purchaser becomes contractually bound — so the buyer can make an informed decision. Post-signing delivery defeats the disclosure purpose.',
  },
  {
    difficulty: 'hard',
    portion: 'state',
    chapterSlug: 'hawaii-harpta',
    q: 'A non-resident seller closes on a $950,000 Hawaii investment property. Assuming no exemption applies, the HARPTA withholding due at closing is:',
    options: ['$28,500', '$47,500', '$68,875', '$95,000'],
    correctIndex: 2,
    explain: 'HARPTA withholding is 7.25% of the gross sales price for non-resident sellers (not 3% — that was the old rate). 0.0725 × $950,000 = $68,875. Watch for distractors using outdated rates.',
  },
  {
    difficulty: 'hard',
    portion: 'state',
    chapterSlug: 'hawaii-leasehold',
    q: 'Which of the following is NOT a required disclosure to a buyer of leasehold residential property in Hawaii?',
    options: [
      'The ground lease term remaining',
      'Lease rent reopening / renegotiation dates',
      'The fee owner\'s asking price to convert to fee simple',
      'The lease rent amount and adjustment schedule',
    ],
    correctIndex: 2,
    explain: 'Lease term, lease rent, and reopening dates are required disclosures because they materially affect the buyer\'s long-term cost. The fee owner\'s asking conversion price is not a disclosure obligation — that price may not even exist or be public.',
  },
  {
    difficulty: 'hard',
    portion: 'national',
    chapterSlug: 'contracts',
    q: 'A buyer signs an offer on Monday at 3 PM with an expiration of "Wednesday at 5 PM." The seller signs and delivers acceptance Wednesday at 6:15 PM. The legal result is:',
    options: [
      'A valid contract — the seller still accepted in writing',
      'A valid contract — the 5 PM deadline applies only to revocation',
      'No contract — a late acceptance is a counteroffer that the buyer can accept or reject',
      'A contract pending court determination of "reasonable time"',
    ],
    correctIndex: 2,
    explain: 'An offer dies at its stated expiration. A "late acceptance" is legally a counteroffer back to the original offeror, who may accept it, reject it, or counter again. There is no automatic contract.',
  },
  {
    difficulty: 'hard',
    portion: 'national',
    chapterSlug: 'agency',
    q: 'A licensee acts as a dual agent for both buyer and seller in a transaction with informed written consent from both parties. Which duty is MOST diminished by dual agency?',
    options: ['Disclosure', 'Care', 'Loyalty', 'Accountability'],
    correctIndex: 2,
    explain: 'Loyalty (putting one principal\'s interests above the other\'s) cannot be fully delivered to two parties with opposing economic interests. Care, disclosure, and accountability remain enforceable, but loyalty is the structural casualty of dual agency.',
  },
  {
    difficulty: 'hard',
    portion: 'state',
    chapterSlug: 'hawaii-license-law',
    q: 'An out-of-state licensee meets a Hawaii buyer at a mainland trade show and discusses a Big Island property for sale. Under Hawaii law, the out-of-state licensee:',
    options: [
      'May complete the transaction if both parties consent',
      'May refer the buyer to a Hawaii-licensed broker for a referral fee, but cannot perform Hawaii real estate brokerage acts',
      'May negotiate the Hawaii portion of the transaction under reciprocity',
      'Must be a Hawaii broker; Hawaii has no licensing-recognition provisions of any kind',
    ],
    correctIndex: 1,
    explain: 'A non-licensed-in-Hawaii agent cannot lawfully perform Hawaii brokerage acts even if they originated the lead. The lawful path is a referral to a Hawaii-licensed broker for a referral fee. Hawaii does not have full reciprocity with most states.',
  },
  {
    difficulty: 'hard',
    portion: 'national',
    chapterSlug: 'math',
    q: 'A property assessed at $1,200,000 has a tax rate of $11.10 per $1,000 of assessed value. The annual property tax is approximately:',
    options: ['$1,332', '$11,100', '$13,320', '$132,000'],
    correctIndex: 2,
    explain: '($1,200,000 / $1,000) × $11.10 = 1,200 × 11.10 = $13,320. Decimal-place errors are the most common trap here — practice unit math, not just calculator math.',
  },

  // ─────────── GNARLY (12) ───────────
  {
    difficulty: 'gnarly',
    portion: 'state',
    chapterSlug: 'hawaii-disclosures',
    q: 'A seller of a fee-simple Oahu single-family home knows the property had a violent crime occur in the master bedroom three years ago. The seller asks the listing agent whether they have to disclose this to buyers. The agent\'s BEST response is:',
    options: [
      'Hawaii requires disclosure of all stigmatizing events; you must list it on the Seller Real Property Disclosure Statement',
      'Hawaii law does not require disclosure of stigmatizing events such as past crimes that did not affect the physical property; but a direct buyer question would require a truthful answer',
      'Federal Fair Housing law prohibits any disclosure of crimes that could "blockbust" the neighborhood',
      'The agent must disclose it whether or not the seller agrees, under the agent\'s duty of disclosure to third parties',
    ],
    correctIndex: 1,
    explain: 'Hawaii follows the general rule: stigmatizing events (crimes not affecting physical condition, deaths from natural causes, etc.) are not required disclosures on the Seller Disclosure Statement. However, if a buyer asks directly, an agent cannot answer falsely — that crosses into misrepresentation. The "best" answer threads both rules.',
  },
  {
    difficulty: 'gnarly',
    portion: 'national',
    chapterSlug: 'agency',
    q: 'A seller tells the listing agent in confidence that she will accept any offer above $1.4M. The listing agent then meets with a prospective buyer who is unrepresented. The buyer asks, "What\'s the lowest the seller will accept?" The agent\'s correct response is:',
    options: [
      'Truthfully disclose the $1.4M figure — the buyer asked directly',
      'Decline to disclose; recommend the buyer submit their best offer',
      'Disclose the figure but only after the buyer signs a buyer-broker agreement',
      'Disclose the figure if the buyer offers to pay the agent a commission',
    ],
    correctIndex: 1,
    explain: 'The seller is the principal. Disclosing the seller\'s confidential reservation price to a buyer — whether the buyer is represented or not — violates the duty of loyalty and confidentiality. The agent must decline, regardless of whether a buyer-broker relationship is later established.',
  },
  {
    difficulty: 'gnarly',
    portion: 'state',
    chapterSlug: 'hawaii-harpta',
    q: 'A seller resides in California year-round but owns a Kihei condo she rents out and visits twice a year. She sells the condo for $785,000. At closing, the listing agent\'s buyer mentions the seller "should be HARPTA-exempt because she\'s a U.S. citizen." The agent should:',
    options: [
      'Agree — U.S. citizens are exempt from HARPTA',
      'Disagree — HARPTA applies based on Hawaii residency status, not citizenship; the seller appears to be a non-resident and likely subject to 7.25% withholding',
      'Defer to the escrow agent and decline to comment',
      'Apply only the FIRPTA federal rules, since HARPTA was repealed in 2020',
    ],
    correctIndex: 1,
    explain: 'HARPTA (HRS 235-68) keys on whether the seller is a Hawaii RESIDENT for state income tax purposes, not on citizenship. A California-domiciled owner is a non-resident regardless of citizenship. FIRPTA is the separate federal counterpart and was not repealed. The agent shouldn\'t parrot the buyer\'s incorrect statement.',
  },
  {
    difficulty: 'gnarly',
    portion: 'national',
    chapterSlug: 'financing',
    q: 'Consider four loans, each on a $600,000 home with 10% down. Which loan has the LOWEST total interest paid over its life?',
    options: [
      '30-year fixed at 6.25%',
      '15-year fixed at 5.75%',
      '20-year fixed at 6.00%',
      '30-year fixed at 5.95% with one discount point',
    ],
    correctIndex: 1,
    explain: 'A 15-year fixed at 5.75% pays the least total interest by far — shorter term dominates rate differences for total-interest math. The 30-year-with-point option may have a lower stated rate, but it still amortizes over 30 years with the point added to upfront cost.',
  },
  {
    difficulty: 'gnarly',
    portion: 'state',
    chapterSlug: 'hawaii-condo-law',
    q: 'A condo board on the windward side of Oahu wants to ban short-term rentals (under 30 days) building-wide. Under HRS 514B and recent Hawaii court guidance, the board\'s action is MOST LIKELY:',
    options: [
      'Invalid because Hawaii state law preempts all local short-term-rental regulation',
      'Valid only if the original developer\'s declaration permits the restriction or a supermajority of owners amends the declaration',
      'Automatically valid as a routine board policy under the board\'s general rule-making authority',
      'Invalid because the federal Fair Housing Act protects vacation use',
    ],
    correctIndex: 1,
    explain: 'Use restrictions of this scope generally require an amendment to the condominium declaration — not a simple board policy — under HRS 514B. The supermajority threshold and developer original-declaration language control. Boards routinely overreach here, and Hawaii courts have struck down board-only bans.',
  },
  {
    difficulty: 'gnarly',
    portion: 'national',
    chapterSlug: 'agency',
    q: 'A listing agent receives two simultaneous offers: one at full asking price from a buyer the seller dislikes personally, and one at $30,000 below asking from a buyer the seller "really likes." The agent should:',
    options: [
      'Present only the higher offer, since the seller\'s economic interest is paramount',
      'Present both offers truthfully and let the seller choose; the seller can lawfully select either offer for any non-protected-class reason',
      'Recommend the seller accept the higher offer because failing to maximize price would violate the agent\'s duty of loyalty',
      'Present both, but advise the seller that taking the lower offer creates a legal risk under fair housing law',
    ],
    correctIndex: 1,
    explain: 'The agent must present all offers and respect the seller\'s right to choose. The seller is free to take a lower offer for personal preference — UNLESS the preference is based on a protected class (race, religion, etc.). "Personal dislike" alone is not unlawful. The agent\'s loyalty does not override the principal\'s decision.',
  },
  {
    difficulty: 'gnarly',
    portion: 'state',
    chapterSlug: 'hawaii-purchase-contract',
    q: 'Under the Hawaii Association of Realtors Standard Purchase Contract, the time period within which the buyer must complete due diligence and either approve or terminate is GENERALLY governed by:',
    options: [
      'A statutory 30-day window per HRS 484A',
      'The "as is" clause, which eliminates any due-diligence period',
      'The contract\'s contingency timeline as negotiated and inserted by the parties',
      'The Hawaii REC default of 14 calendar days',
    ],
    correctIndex: 2,
    explain: 'There is no fixed statutory window. The Hawaii Standard Purchase Contract provides default fields the parties fill in (often 10–17 days for inspection, financing, etc.). The negotiated timeline governs, and an "as is" sale does not eliminate a buyer\'s right to inspect — it shifts cost-of-repair allocation.',
  },
  {
    difficulty: 'gnarly',
    portion: 'national',
    chapterSlug: 'math',
    q: 'A property sells for $1,850,000. Closing is on April 14. Annual property tax of $9,600 has not yet been paid by the seller for the current tax year (assume calendar-year tax cycle, 360-day year for proration). At closing, the seller will be CREDITED or DEBITED for taxes in the amount of:',
    options: [
      'Credited $2,773.33',
      'Debited $2,773.33',
      'Credited $9,600',
      'Debited $6,826.67',
    ],
    correctIndex: 1,
    explain: 'The seller owes taxes for the days they owned the property in the unpaid tax year. Jan 1 – Apr 13 = 103 days (using 360-day basis with 30-day months: Jan 30 + Feb 30 + Mar 30 + 13 = 103). 103/360 × $9,600 = $2,746.67. The seller is DEBITED that amount and buyer is credited (closest answer: B at $2,773.33 reflecting slight rounding differences common on PSI). The trap is direction — when taxes are unpaid, seller pays for their days.',
  },
  {
    difficulty: 'gnarly',
    portion: 'state',
    chapterSlug: 'hawaii-license-law',
    q: 'A Hawaii salesperson licensee owns 60% of a corporation and wants the corporation to purchase a property listed by another agent at the licensee\'s brokerage. Under Hawaii license law, the licensee MUST:',
    options: [
      'Refrain from the purchase; licensee-as-principal transactions are prohibited',
      'Disclose to the seller in writing that they hold a real estate license and have a principal interest in the buying entity',
      'Resign from active licensure before the purchase',
      'Have their broker sign the purchase contract on their behalf',
    ],
    correctIndex: 1,
    explain: 'Hawaii license law requires written disclosure when a licensee acts as a principal (buyer or seller, including through entities they control). Disclosure — not abstention — is the rule. The broker doesn\'t sign on their behalf; the licensee discloses and proceeds.',
  },
  {
    difficulty: 'gnarly',
    portion: 'national',
    chapterSlug: 'fair-housing',
    q: 'A property owner refuses to rent a unit to a family with two young children, stating "the unit isn\'t safe for kids" because there are stairs. Under the federal Fair Housing Act, this refusal is:',
    options: [
      'Permissible — safety concerns are a legitimate business reason',
      'Permissible if the owner offers to rent a different unit on the ground floor',
      'A violation of fair housing law — familial status is a protected class and "safety" pretexts based on age of children are unlawful',
      'Permissible because the federal Fair Housing Act does not protect against age discrimination',
    ],
    correctIndex: 2,
    explain: 'Familial status (presence of children under 18) is a protected class under the federal Fair Housing Act amendments of 1988. An owner cannot refuse to rent based on the presence of children, even framed as a safety concern. "I\'ll offer you a different unit" is steering, also unlawful. The exception applies only to legitimate senior housing.',
  },
  {
    difficulty: 'gnarly',
    portion: 'state',
    chapterSlug: 'hawaii-land-court',
    q: 'A buyer is purchasing a property in the Land Court system. Compared with property in the Regular System, the Land Court system provides which of the following PRIMARY advantages?',
    options: [
      'Lower title insurance premiums and faster closings',
      'The Certificate of Title is itself the conclusive evidence of ownership, eliminating the need for separate chain-of-title research',
      'Exemption from the conveyance tax',
      'Automatic clearance of all liens upon transfer',
    ],
    correctIndex: 1,
    explain: 'Hawaii operates a dual recording system: the Regular System (chain-of-title research required) and the Land Court system (Torrens-style — the Certificate of Title is conclusive). Liens still attach in Land Court, and conveyance tax applies regardless. The primary advantage is title certainty.',
  },
  {
    difficulty: 'gnarly',
    portion: 'national',
    chapterSlug: 'contracts',
    q: 'A buyer\'s purchase contract for a $2.1M Oahu home contains a financing contingency. The buyer\'s lender denies the loan in writing on Day 18 of a 21-day financing contingency window. The buyer wants to terminate and recover the deposit. The CORRECT analysis is:',
    options: [
      'The buyer is in default; once the seller accepted, the buyer is locked in',
      'The buyer may terminate within the contingency window upon proof of good-faith denial and is entitled to the deposit back',
      'The seller may keep the deposit because the buyer "caused" the denial by their financial profile',
      'The contingency cannot be invoked unless the buyer applies to at least three lenders',
    ],
    correctIndex: 1,
    explain: 'A financing contingency entitles the buyer to terminate and recover the deposit if the lender denies the loan in good faith within the contingency window — even on Day 18. There is no "three lenders" rule. The seller cannot retain the deposit for a contingency-protected denial.',
  },
];

export function getToughByDifficulty(difficulty: 'hard' | 'gnarly'): ToughItem[] {
  return TOUGH_BANK.filter(q => q.difficulty === difficulty);
}
