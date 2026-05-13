// ABOUTME: Additional question variants merged into the existing question banks.
// ABOUTME: One key per question ID; value is an array of additional variants (variant 0 stays as the original).

import type { QuestionId, Variant } from './question-variants';

// SEED variant set. Hand-authored examples to prove the system works end
// to end with multiple variants. A separate generation pass (Task #30)
// will populate 5-10 variants per question across all 20 chapters.
//
// Each entry maps a question ID (chapterSlug + '-q' + NN) to additional
// variants that test the SAME concept with different wording, different
// distractors, or a different angle. The original question stays at
// variant index 0 — entries here become variants 1, 2, 3, etc.
//
// Authoring rules:
//   - Same concept tested; do not change the underlying right answer
//   - Distractors should be plausible-but-wrong (real Hawaii REC vocab)
//   - Wording variation should be substantive — not just synonym swaps
//   - Explanation must justify the right answer, not just restate it
export const VARIANT_POOL: Record<QuestionId, Variant[]> = {
  // Chapter 1: Property Ownership — built-in dishwasher question (q00)
  'property-ownership-q00': [
    {
      q: 'A homeowner installs a built-in microwave above the cooktop. When the home sells, the microwave is:',
      options: ['Personal property the seller takes', 'A trade fixture the buyer can remove', 'A fixture that conveys with the property', 'An emblement subject to harvest'],
      correctIndex: 2,
      explain: 'Built-in appliances mounted into the cabinetry pass the intent + adaptation tests for fixtures and convey with the property.',
    },
    {
      q: 'Which of these would MOST likely be classified as a fixture in a residential sale?',
      options: ['A free-standing washer/dryer', 'A potted lemon tree', 'A custom-built bookcase bolted to the wall', 'A garage door opener remote'],
      correctIndex: 2,
      explain: 'A bookcase bolted into the wall meets the "method of attachment" and "adaptation" tests for fixtures.',
    },
  ],

  // Chapter 1: Right of survivorship question (q01)
  'property-ownership-q01': [
    {
      q: 'Two siblings own a condo. When one dies, the survivor automatically owns the entire unit. The siblings hold title as:',
      options: ['Tenants in common', 'Joint tenants', 'Tenants by the entirety', 'Tenants in severalty'],
      correctIndex: 1,
      explain: 'Automatic transfer on death = right of survivorship, which is the defining feature of joint tenancy.',
    },
    {
      q: 'Which form of co-ownership requires the four unities (time, title, interest, possession)?',
      options: ['Tenancy in common', 'Joint tenancy', 'Community property', 'Severalty'],
      correctIndex: 1,
      explain: 'Joint tenancy requires all four unities (TTIP) — break any one and it converts to tenancy in common.',
    },
  ],

  // Chapter 1: Greatest possible interest (q02)
  'property-ownership-q02': [
    {
      q: 'An owner who can sell, lease, will, or modify the property without time limits or conditions holds:',
      options: ['A life estate', 'Fee simple absolute', 'A determinable fee', 'A leasehold estate'],
      correctIndex: 1,
      explain: 'Fee simple absolute is the maximum bundle of rights — unlimited duration, no conditions.',
    },
  ],

  // Chapter 1: Encroachment (q03)
  'property-ownership-q03': [
    {
      q: 'A homeowner builds a shed that extends 2 feet into the neighbor\'s yard. The shed is:',
      options: ['An easement appurtenant', 'An encroachment', 'A license', 'An emblement'],
      correctIndex: 1,
      explain: 'Unauthorized physical intrusion onto another\'s property = encroachment, typically discovered via survey.',
    },
  ],

  // Chapter 12 (Hawaii): Material facts question (q00, q01) — examples
  'hi-material-facts-q00': [
    {
      q: 'Hawaii\'s Bureau of Conveyances is responsible for:',
      options: ['Issuing real estate licenses', 'Recording real estate documents', 'Administering the PSI exam', 'Setting property tax rates'],
      correctIndex: 1,
      explain: 'The Bureau of Conveyances records deeds, mortgages, leases — Hawaii\'s public record system. Licensing is REB; PSI is the testing vendor.',
    },
  ],

  // ---- More variants populated by the AI generation script (Task #30). ----
};
