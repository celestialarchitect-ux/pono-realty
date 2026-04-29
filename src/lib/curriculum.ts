// PONO REALTY ACADEMY — Curriculum index aligned to the official PSI Hawaii
// Real Estate Examination Content Outline (public document). Question counts
// match the PSI blueprint exactly.

export interface ChapterMeta {
  slug: string;
  number: number;
  portion: 'national' | 'state';
  title: string;
  examItems: number;       // PSI question count for this section
  description: string;
  estimatedMinutes: number;
  keyTerms: number;
}

export const CURRICULUM: ChapterMeta[] = [
  // ─── National Portion (80 items) ───
  { slug: 'property-ownership', number: 1, portion: 'national', title: 'Property Ownership', examItems: 6, description: 'Real vs personal property, fixtures, estates, forms of ownership, encumbrances, bundle of rights.', estimatedMinutes: 45, keyTerms: 22 },
  { slug: 'land-use-controls', number: 2, portion: 'national', title: 'Land Use Controls & Regulations', examItems: 5, description: 'Government rights, police power, zoning, environmental hazards, private deed restrictions.', estimatedMinutes: 35, keyTerms: 18 },
  { slug: 'valuation-market-analysis', number: 3, portion: 'national', title: 'Valuation & Market Analysis', examItems: 8, description: 'Market value, three appraisal approaches, CMA, depreciation, GRM/GIM.', estimatedMinutes: 60, keyTerms: 24 },
  { slug: 'financing', number: 4, portion: 'national', title: 'Financing', examItems: 7, description: 'LTV, points, loan types, FHA/VA, mortgage clauses, RESPA, Truth in Lending.', estimatedMinutes: 60, keyTerms: 28 },
  { slug: 'laws-of-agency', number: 5, portion: 'national', title: 'Laws of Agency', examItems: 10, description: 'Agency types, fiduciary duties (COALD), disclosure, dual agency, termination.', estimatedMinutes: 60, keyTerms: 20 },
  { slug: 'mandated-disclosures', number: 6, portion: 'national', title: 'Mandated Disclosures', examItems: 7, description: 'Property condition forms, material facts, environmental hazards, stigmatized property.', estimatedMinutes: 50, keyTerms: 18 },
  { slug: 'contracts', number: 7, portion: 'national', title: 'Contracts', examItems: 10, description: 'Validity, listing types, purchase agreements, contingencies, breach, remedies.', estimatedMinutes: 70, keyTerms: 24 },
  { slug: 'transfer-of-title', number: 8, portion: 'national', title: 'Transfer of Title', examItems: 4, description: 'Title insurance, deeds, recording, escrow, foreclosure, tax aspects.', estimatedMinutes: 40, keyTerms: 18 },
  { slug: 'practice-of-real-estate', number: 9, portion: 'national', title: 'The Practice of Real Estate', examItems: 12, description: 'Trust accounts, fair housing, advertising, supervision, ethics, antitrust.', estimatedMinutes: 70, keyTerms: 26 },
  { slug: 'real-estate-calculations', number: 10, portion: 'national', title: 'Real Estate Calculations', examItems: 7, description: 'Math: areas, percentages, prorations, commissions, LTV, capitalization.', estimatedMinutes: 90, keyTerms: 16 },
  { slug: 'specialty-areas', number: 11, portion: 'national', title: 'Specialty Areas', examItems: 4, description: 'Property management, common interest, subdivisions, commercial.', estimatedMinutes: 35, keyTerms: 14 },

  // ─── State Portion (50 items) ───
  { slug: 'hi-material-facts', number: 12, portion: 'state', title: 'Hawaii: Ascertaining & Disclosing Material Facts', examItems: 8, description: 'Bureau of Conveyances, HARPTA, GET, statutory disclosures, leasehold disclosure.', estimatedMinutes: 55, keyTerms: 20 },
  { slug: 'hi-types-of-ownership', number: 13, portion: 'state', title: 'Hawaii: Types of Ownership', examItems: 6, description: 'Condominiums (HRS 514B), cooperatives, time shares, land trusts, PUDs.', estimatedMinutes: 50, keyTerms: 18 },
  { slug: 'hi-property-management', number: 14, portion: 'state', title: 'Hawaii: Property Management', examItems: 3, description: 'Residential Landlord-Tenant Code (HRS 521), security deposits, eviction.', estimatedMinutes: 35, keyTerms: 14 },
  { slug: 'hi-land-utilization', number: 15, portion: 'state', title: 'Hawaii: Land Utilization', examItems: 2, description: 'County zoning, restrictive covenants, state land use districts, Special Management Areas.', estimatedMinutes: 25, keyTerms: 10 },
  { slug: 'hi-title-conveyances', number: 16, portion: 'state', title: 'Hawaii: Title & Conveyances', examItems: 4, description: 'Estates, tenancies, liens, leaseholds, Land Court vs Regular System, foreclosure.', estimatedMinutes: 45, keyTerms: 16 },
  { slug: 'hi-contracts-addenda', number: 17, portion: 'state', title: 'Hawaii: Contracts & Addenda', examItems: 6, description: 'Hawaii standard sales contract, listing agreements, required addenda.', estimatedMinutes: 50, keyTerms: 14 },
  { slug: 'hi-financing', number: 18, portion: 'state', title: 'Hawaii: Financing', examItems: 4, description: 'Agreement of sale, PMM, Hawaii institutional financing, usury.', estimatedMinutes: 40, keyTerms: 12 },
  { slug: 'hi-escrow-closing', number: 19, portion: 'state', title: 'Hawaii: Escrow Process & Closing', examItems: 3, description: 'Escrow responsibilities, closing statements, conveyance tax, prorations.', estimatedMinutes: 35, keyTerms: 12 },
  { slug: 'hi-professional-conduct', number: 20, portion: 'state', title: 'Hawaii: Professional Practices & Conduct', examItems: 14, description: 'License law (HRS 467), trust accounts, advertising rules, disciplinary action, agency disclosure.', estimatedMinutes: 90, keyTerms: 30 },
];

export const NATIONAL_TOTAL = CURRICULUM.filter(c => c.portion === 'national').reduce((s, c) => s + c.examItems, 0); // 80
export const STATE_TOTAL = CURRICULUM.filter(c => c.portion === 'state').reduce((s, c) => s + c.examItems, 0); // 50
export const PASSING_PCT = 70;
export const TOTAL_QUESTIONS = NATIONAL_TOTAL + STATE_TOTAL; // 130

export function getChapter(slug: string): ChapterMeta | null {
  return CURRICULUM.find(c => c.slug === slug) ?? null;
}

export function chapterIndex(slug: string): number {
  return CURRICULUM.findIndex(c => c.slug === slug);
}

export function neighbors(slug: string): { prev: ChapterMeta | null; next: ChapterMeta | null } {
  const idx = chapterIndex(slug);
  return {
    prev: idx > 0 ? CURRICULUM[idx - 1] : null,
    next: idx < CURRICULUM.length - 1 ? CURRICULUM[idx + 1] : null,
  };
}
