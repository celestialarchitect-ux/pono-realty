// Real estate math drills — original worked examples covering all common
// PSI exam math types. Each problem includes step-by-step solution.

export interface MathProblem {
  id: string;
  category: 'areas' | 'percentages' | 'commission' | 'financing' | 'prorations' | 'taxes' | 'investment' | 'closing';
  question: string;
  given: string[];
  steps: string[];
  answer: string;
  formula?: string;
}

export const MATH_PROBLEMS: MathProblem[] = [
  // ─── Areas ───
  {
    id: 'areas-1',
    category: 'areas',
    question: 'A rectangular lot is 150 feet wide and 290 feet deep. What is its area in acres?',
    given: ['Width: 150 ft', 'Depth: 290 ft', '1 acre = 43,560 sq ft'],
    formula: 'Area (sq ft) = L × W; Acres = sq ft ÷ 43,560',
    steps: [
      '150 × 290 = 43,500 sq ft',
      '43,500 ÷ 43,560 = 0.9986 acres',
    ],
    answer: '≈ 1.00 acre (very nearly exact)',
  },
  {
    id: 'areas-2',
    category: 'areas',
    question: 'A triangular lot has a base of 200 ft and a height of 300 ft. What is its area?',
    given: ['Base: 200 ft', 'Height: 300 ft'],
    formula: '½ × Base × Height',
    steps: [
      '½ × 200 × 300 = 30,000 sq ft',
      '30,000 ÷ 43,560 = 0.69 acres',
    ],
    answer: '30,000 sq ft (≈ 0.69 acres)',
  },
  {
    id: 'areas-3',
    category: 'areas',
    question: 'A circular pond on a property has a radius of 50 ft. How many square feet does it cover?',
    given: ['Radius: 50 ft', 'π ≈ 3.14'],
    formula: 'π × r²',
    steps: [
      '3.14 × 50² = 3.14 × 2,500',
      '= 7,854 sq ft (using π)',
    ],
    answer: '≈ 7,854 sq ft',
  },
  {
    id: 'areas-4',
    category: 'areas',
    question: 'A section of land contains how many acres?',
    given: ['1 section = 1 sq mile = 5,280 ft × 5,280 ft', '1 acre = 43,560 sq ft'],
    formula: 'Section sq ft ÷ 43,560',
    steps: [
      '5,280 × 5,280 = 27,878,400 sq ft',
      '27,878,400 ÷ 43,560 = 640 acres',
    ],
    answer: '640 acres per section',
  },

  // ─── Percentages ───
  {
    id: 'pct-1',
    category: 'percentages',
    question: 'If $4,800 is 6% of the sale price, what is the sale price?',
    given: ['Part: $4,800', 'Rate: 6%'],
    formula: 'Whole = Part ÷ Rate',
    steps: [
      '$4,800 ÷ 0.06 = $80,000',
    ],
    answer: '$80,000',
  },
  {
    id: 'pct-2',
    category: 'percentages',
    question: 'A house sold for $325,000. The buyer paid 3% as earnest money. How much was that?',
    given: ['Sale price: $325,000', 'Rate: 3%'],
    formula: 'Part = Whole × Rate',
    steps: [
      '$325,000 × 0.03 = $9,750',
    ],
    answer: '$9,750',
  },

  // ─── Commission ───
  {
    id: 'comm-1',
    category: 'commission',
    question: 'A property sells for $425,000 with a 6% total commission. The listing brokerage gets 50%, and the listing agent gets 70% of the brokerage\'s share. How much does the listing agent personally make?',
    given: ['Sale: $425,000', 'Commission: 6%', 'Listing brokerage split: 50%', 'Agent split: 70%'],
    formula: 'Agent = Sale × Comm% × Brokerage split × Agent split',
    steps: [
      'Total commission: $425,000 × 0.06 = $25,500',
      'Listing brokerage share: $25,500 × 0.50 = $12,750',
      'Listing agent share: $12,750 × 0.70 = $8,925',
    ],
    answer: '$8,925',
  },
  {
    id: 'comm-2',
    category: 'commission',
    question: 'An agent earned $7,200 in commission, which represented 60% of their brokerage\'s commission share on a 6% total commission. What was the sale price?',
    given: ['Agent commission: $7,200', 'Agent split: 60%', 'Brokerage share of total: assume 50%', 'Total commission rate: 6%'],
    formula: 'Work backward from agent take to total commission to sale price',
    steps: [
      'Brokerage share of total commission: $7,200 ÷ 0.60 = $12,000',
      'Total commission: $12,000 ÷ 0.50 = $24,000',
      'Sale price: $24,000 ÷ 0.06 = $400,000',
    ],
    answer: '$400,000',
  },

  // ─── Financing ───
  {
    id: 'fin-1',
    category: 'financing',
    question: 'A buyer purchases a $480,000 home with a 20% down payment. What is the loan amount?',
    given: ['Sale price: $480,000', 'Down payment: 20%'],
    formula: 'Loan = Price × (1 − Down %)',
    steps: [
      'Down payment: $480,000 × 0.20 = $96,000',
      'Loan amount: $480,000 − $96,000 = $384,000',
    ],
    answer: '$384,000',
  },
  {
    id: 'fin-2',
    category: 'financing',
    question: 'A buyer pays 2 discount points on a $300,000 loan. How much does this cost?',
    given: ['Loan: $300,000', 'Points: 2'],
    formula: 'Points cost = Loan × Points × 1%',
    steps: [
      '2 × 1% = 2% of loan',
      '$300,000 × 0.02 = $6,000',
    ],
    answer: '$6,000',
  },
  {
    id: 'fin-3',
    category: 'financing',
    question: 'On a $250,000 loan at 6% annual interest, how much interest accrues per day (using 360-day year)?',
    given: ['Loan: $250,000', 'Rate: 6%', '360-day year'],
    formula: 'Daily interest = Loan × Rate ÷ 360',
    steps: [
      'Annual interest: $250,000 × 0.06 = $15,000',
      'Daily interest: $15,000 ÷ 360 = $41.67',
    ],
    answer: '$41.67 per day',
  },
  {
    id: 'fin-4',
    category: 'financing',
    question: 'A buyer purchases a property for $350,000 with a $280,000 loan. What is the LTV?',
    given: ['Property value: $350,000', 'Loan: $280,000'],
    formula: 'LTV = Loan ÷ Value',
    steps: [
      '$280,000 ÷ $350,000 = 0.80 = 80%',
    ],
    answer: '80% LTV (right at the PMI threshold for conventional)',
  },

  // ─── Prorations ───
  {
    id: 'pror-1',
    category: 'prorations',
    question: 'Annual property tax is $4,800. Closing is on April 30 (using 360-day year, seller pays through the closing day). What is the seller\'s prorated share?',
    given: ['Annual tax: $4,800', 'Closing: April 30', '360-day year'],
    formula: 'Seller share = Annual ÷ 360 × Days from Jan 1 to closing',
    steps: [
      'Days from Jan 1 to April 30: 30 + 30 + 30 + 30 = 120 days (using 30-day months)',
      'Daily tax: $4,800 ÷ 360 = $13.33',
      'Seller share: $13.33 × 120 = $1,600',
    ],
    answer: '$1,600 seller debit / buyer credit',
  },
  {
    id: 'pror-2',
    category: 'prorations',
    question: 'Monthly condo maintenance fee is $450, paid in advance on the 1st. Closing is on the 15th. The seller paid for the full month. How much does the buyer owe the seller at closing?',
    given: ['Monthly fee: $450', 'Closing: 15th of month', 'Seller paid full month in advance'],
    formula: 'Buyer owes seller for unused days',
    steps: [
      'Seller used: 15 days; remaining: 15 days (assuming 30-day month)',
      'Daily fee: $450 ÷ 30 = $15',
      'Buyer credit to seller: $15 × 15 = $225',
    ],
    answer: '$225 buyer debit / seller credit',
  },

  // ─── Taxes ───
  {
    id: 'tax-1',
    category: 'taxes',
    question: 'A property has an assessed value of $380,000 and a mill rate of 18 mills. What is the annual property tax?',
    given: ['Assessed value: $380,000', 'Mill rate: 18 mills'],
    formula: 'Tax = Assessed Value × Mills ÷ 1,000',
    steps: [
      '$380,000 × 18 ÷ 1,000 = $6,840',
    ],
    answer: '$6,840 annual property tax',
  },
  {
    id: 'tax-2',
    category: 'taxes',
    question: 'Hawaii owner-occupant conveyance tax is approximately $0.10 per $100 of sale price (verify current). On a $700,000 owner-occupied sale, what\'s the conveyance tax?',
    given: ['Sale price: $700,000', 'Rate: $0.10 per $100'],
    formula: 'Tax = Sale ÷ $100 × Rate',
    steps: [
      '$700,000 ÷ $100 = 7,000 units',
      '7,000 × $0.10 = $700',
    ],
    answer: '$700 (verify current Hawaii conveyance tax schedule for actual rate)',
  },

  // ─── Investment ───
  {
    id: 'inv-1',
    category: 'investment',
    question: 'A four-plex generates $52,000 NOI. Comparable cap rate is 6.5%. What\'s the indicated value?',
    given: ['NOI: $52,000', 'Cap rate: 6.5%'],
    formula: 'Value = NOI ÷ Cap Rate',
    steps: [
      '$52,000 ÷ 0.065 = $800,000',
    ],
    answer: '$800,000',
  },
  {
    id: 'inv-2',
    category: 'investment',
    question: 'A property is on the market for $750,000 with reported NOI of $60,000. What is the implied cap rate?',
    given: ['Asking price: $750,000', 'NOI: $60,000'],
    formula: 'Cap Rate = NOI ÷ Value',
    steps: [
      '$60,000 ÷ $750,000 = 0.08 = 8%',
    ],
    answer: '8% cap rate',
  },
  {
    id: 'inv-3',
    category: 'investment',
    question: 'A property has gross income of $144,000 annually (10% vacancy expected) and operating expenses of $48,000. Calculate NOI.',
    given: ['Gross income: $144,000', 'Vacancy: 10%', 'Operating expenses: $48,000'],
    formula: 'NOI = (Gross Income − Vacancy) − Operating Expenses',
    steps: [
      'Vacancy loss: $144,000 × 0.10 = $14,400',
      'Effective Gross Income: $144,000 − $14,400 = $129,600',
      'NOI: $129,600 − $48,000 = $81,600',
    ],
    answer: '$81,600 NOI',
  },
  {
    id: 'inv-4',
    category: 'investment',
    question: 'A duplex rents for $1,800/month total. Comparable GRM is 145. What is the indicated value?',
    given: ['Monthly rent: $1,800', 'GRM: 145'],
    formula: 'Value = Monthly Rent × GRM',
    steps: [
      '$1,800 × 145 = $261,000',
    ],
    answer: '$261,000',
  },
  {
    id: 'inv-5',
    category: 'investment',
    question: 'NOI is $96,000. Annual debt service is $72,000. Calculate DSCR.',
    given: ['NOI: $96,000', 'Annual debt service: $72,000'],
    formula: 'DSCR = NOI ÷ Annual Debt Service',
    steps: [
      '$96,000 ÷ $72,000 = 1.33',
    ],
    answer: '1.33 (above the typical 1.20 lender minimum)',
  },

  // ─── Closing ───
  {
    id: 'close-1',
    category: 'closing',
    question: 'A buyer is purchasing a $500,000 home with 20% down. Estimated closing costs are $8,500. The buyer received a credit of $2,000 from seller. How much cash does the buyer need at closing (excluding prorations)?',
    given: ['Sale: $500,000', 'Down: 20%', 'Closing costs: $8,500', 'Seller credit: $2,000'],
    formula: 'Cash needed = Down + Closing costs − Credits',
    steps: [
      'Down payment: $500,000 × 0.20 = $100,000',
      'Plus closing costs: $100,000 + $8,500 = $108,500',
      'Less seller credit: $108,500 − $2,000 = $106,500',
    ],
    answer: '$106,500 cash needed at closing',
  },
  {
    id: 'close-2',
    category: 'closing',
    question: 'A seller sells for $620,000. Their loan payoff is $380,000, broker commission is 6%, closing costs are $4,800, and HARPTA withholding (assume non-resident, 7.25%) applies. Calculate net to seller.',
    given: ['Sale: $620,000', 'Loan payoff: $380,000', 'Commission: 6%', 'Closing costs: $4,800', 'HARPTA: 7.25%'],
    formula: 'Net = Sale − Payoff − Commission − Closing costs − HARPTA',
    steps: [
      'Commission: $620,000 × 0.06 = $37,200',
      'HARPTA withholding: $620,000 × 0.0725 = $44,950',
      'Total deductions: $380,000 + $37,200 + $4,800 + $44,950 = $466,950',
      'Net to seller (before HARPTA refund/credit): $620,000 − $466,950 = $153,050',
    ],
    answer: '$153,050 net to seller (HARPTA may be refunded later upon Hawaii tax filing)',
  },

  // ─── Profit ───
  {
    id: 'profit-1',
    category: 'investment',
    question: 'An investor bought a property for $280,000 and sold it 3 years later for $385,000. What was the % profit?',
    given: ['Cost: $280,000', 'Sale: $385,000'],
    formula: '% Profit = (Sale − Cost) ÷ Cost × 100',
    steps: [
      'Profit: $385,000 − $280,000 = $105,000',
      '% Profit: $105,000 ÷ $280,000 = 0.375 = 37.5%',
    ],
    answer: '37.5% profit',
  },
  {
    id: 'profit-2',
    category: 'investment',
    question: 'A flipper wants a 25% profit on a property they bought for $360,000. What\'s the target sale price?',
    given: ['Cost: $360,000', 'Target profit: 25%'],
    formula: 'Target Sale = Cost × (1 + Profit %)',
    steps: [
      '$360,000 × 1.25 = $450,000',
    ],
    answer: '$450,000 target sale price',
  },
];

export const MATH_CATEGORIES = ['areas', 'percentages', 'commission', 'financing', 'prorations', 'taxes', 'investment', 'closing'] as const;
