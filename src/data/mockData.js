/* ── Categories ──────────────────────────────────── */
export const CATEGORIES = [
  { id: 'food',          name: 'Food & Dining',    color: '#f97316', icon: 'UtensilsCrossed' },
  { id: 'transport',     name: 'Transport',         color: '#3b82f6', icon: 'Car'             },
  { id: 'shopping',      name: 'Shopping',          color: '#a855f7', icon: 'ShoppingBag'     },
  { id: 'bills',         name: 'Bills & Utilities', color: '#ef4444', icon: 'Zap'             },
  { id: 'entertainment', name: 'Entertainment',     color: '#ec4899', icon: 'Gamepad2'        },
  { id: 'health',        name: 'Health',            color: '#10b981', icon: 'Heart'           },
  { id: 'salary',        name: 'Salary',            color: '#22c55e', icon: 'Briefcase'       },
  { id: 'freelance',     name: 'Freelance',         color: '#06b6d4', icon: 'Laptop'          },
  { id: 'investment',    name: 'Investment',        color: '#eab308', icon: 'TrendingUp'      },
  { id: 'other',         name: 'Other',             color: '#6b7280', icon: 'MoreHorizontal'  },
];

export const getCategoryByID = (id) =>
  CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

/* ── ID generator ────────────────────────────────── */
let _counter = 1;
export const generateId = () => `txn_${Date.now()}_${_counter++}`;

/* ── Mock Transactions (Nov 2025 – Apr 2026) ─────── */
export const INITIAL_TRANSACTIONS = [

  /* ── November 2025 ──────────────────────────────── */
  { id: generateId(), date: '2025-11-01', description: 'Monthly Salary',        amount: 5200.00, category: 'salary',        type: 'income'  },
  { id: generateId(), date: '2025-11-02', description: 'Bonus',        amount: 10000.00, category: 'Bonus',        type: 'income'  },
  { id: generateId(), date: '2025-11-03', description: 'Grocery Store',         amount:   87.50, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2025-11-05', description: 'Electric Bill',         amount:  142.00, category: 'bills',         type: 'expense' },
  { id: generateId(), date: '2025-11-07', description: 'Uber Rides',            amount:   34.20, category: 'transport',     type: 'expense' },
  { id: generateId(), date: '2025-11-10', description: 'Netflix Subscription',  amount:   15.99, category: 'entertainment', type: 'expense' },
  { id: generateId(), date: '2025-11-12', description: 'Freelance Web Project', amount: 1200.00, category: 'freelance',     type: 'income'  },
  { id: generateId(), date: '2025-11-14', description: 'Pharmacy',              amount:   45.00, category: 'health',        type: 'expense' },
  { id: generateId(), date: '2025-11-18', description: 'Amazon Purchase',       amount:  129.99, category: 'shopping',      type: 'expense' },
  { id: generateId(), date: '2025-11-22', description: 'Restaurant Dinner',     amount:   68.50, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2025-11-25', description: 'Gas Station',           amount:   55.00, category: 'transport',     type: 'expense' },

  /* ── December 2025 ──────────────────────────────── */
  { id: generateId(), date: '2025-12-01', description: 'Monthly Salary',         amount: 5200.00, category: 'salary',        type: 'income'  },
  { id: generateId(), date: '2025-12-02', description: 'Internet Bill',          amount:   79.99, category: 'bills',         type: 'expense' },
  { id: generateId(), date: '2025-12-05', description: 'Holiday Shopping',       amount:  342.50, category: 'shopping',      type: 'expense' },
  { id: generateId(), date: '2025-12-08', description: 'Grocery Store',          amount:  112.30, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2025-12-10', description: 'Spotify Premium',        amount:    9.99, category: 'entertainment', type: 'expense' },
  { id: generateId(), date: '2025-12-12', description: 'Freelance Design Work',  amount:  800.00, category: 'freelance',     type: 'income'  },
  { id: generateId(), date: '2025-12-15', description: 'Train Tickets',          amount:   62.00, category: 'transport',     type: 'expense' },
  { id: generateId(), date: '2025-12-18', description: 'Gym Membership',         amount:   49.99, category: 'health',        type: 'expense' },
  { id: generateId(), date: '2025-12-20', description: 'Water Bill',             amount:   38.50, category: 'bills',         type: 'expense' },
  { id: generateId(), date: '2025-12-25', description: 'Christmas Bonus',        amount: 1500.00, category: 'salary',        type: 'income'  },
  { id: generateId(), date: '2025-12-28', description: 'Year End Party',         amount:   95.00, category: 'entertainment', type: 'expense' },

  /* ── January 2026 ───────────────────────────────── */
  { id: generateId(), date: '2026-01-01', description: 'Monthly Salary',              amount: 5400.00, category: 'salary',        type: 'income'  },
  { id: generateId(), date: '2026-01-03', description: 'Grocery Store',              amount:   95.20, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2026-01-05', description: 'Electric Bill',              amount:  158.00, category: 'bills',         type: 'expense' },
  { id: generateId(), date: '2026-01-08', description: 'New Shoes',                  amount:  189.99, category: 'shopping',      type: 'expense' },
  { id: generateId(), date: '2026-01-10', description: 'Doctor Visit',               amount:  120.00, category: 'health',        type: 'expense' },
  { id: generateId(), date: '2026-01-12', description: 'Bus Pass',                   amount:   85.00, category: 'transport',     type: 'expense' },
  { id: generateId(), date: '2026-01-15', description: 'Freelance App Development',  amount: 2000.00, category: 'freelance',     type: 'income'  },
  { id: generateId(), date: '2026-01-18', description: 'Movie Tickets',              amount:   28.00, category: 'entertainment', type: 'expense' },
  { id: generateId(), date: '2026-01-22', description: 'Coffee Shop',               amount:   22.50, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2026-01-28', description: 'Investment Dividend',        amount:  350.00, category: 'investment',    type: 'income'  },

  /* ── February 2026 ──────────────────────────────── */
  { id: generateId(), date: '2026-02-01', description: 'Monthly Salary',        amount: 5400.00, category: 'salary',        type: 'income'  },
  { id: generateId(), date: '2026-02-03', description: 'Valentine Dinner',      amount:  145.00, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2026-02-05', description: 'Internet Bill',         amount:   79.99, category: 'bills',         type: 'expense' },
  { id: generateId(), date: '2026-02-07', description: 'Uber Rides',            amount:   42.80, category: 'transport',     type: 'expense' },
  { id: generateId(), date: '2026-02-10', description: 'Gaming Subscription',   amount:   14.99, category: 'entertainment', type: 'expense' },
  { id: generateId(), date: '2026-02-12', description: 'Grocery Store',         amount:  103.40, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2026-02-15', description: 'Freelance Consulting',  amount: 1500.00, category: 'freelance',     type: 'income'  },
  { id: generateId(), date: '2026-02-18', description: 'Pharmacy',              amount:   32.00, category: 'health',        type: 'expense' },
  { id: generateId(), date: '2026-02-22', description: 'Online Course',         amount:  199.99, category: 'shopping',      type: 'expense' },
  { id: generateId(), date: '2026-02-25', description: 'Water Bill',            amount:   35.50, category: 'bills',         type: 'expense' },

  /* ── March 2026 ─────────────────────────────────── */
  { id: generateId(), date: '2026-03-01', description: 'Monthly Salary',          amount: 5400.00, category: 'salary',        type: 'income'  },
  { id: generateId(), date: '2026-03-03', description: 'Grocery Store',           amount:   88.90, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2026-03-05', description: 'Electric Bill',           amount:  135.00, category: 'bills',         type: 'expense' },
  { id: generateId(), date: '2026-03-07', description: 'Gas Station',             amount:   60.00, category: 'transport',     type: 'expense' },
  { id: generateId(), date: '2026-03-10', description: 'Concert Tickets',         amount:   85.00, category: 'entertainment', type: 'expense' },
  { id: generateId(), date: '2026-03-12', description: 'Freelance Logo Design',   amount:  650.00, category: 'freelance',     type: 'income'  },
  { id: generateId(), date: '2026-03-15', description: 'New Jacket',              amount:  159.99, category: 'shopping',      type: 'expense' },
  { id: generateId(), date: '2026-03-18', description: 'Gym Membership',          amount:   49.99, category: 'health',        type: 'expense' },
  { id: generateId(), date: '2026-03-20', description: 'Restaurant Lunch',        amount:   38.50, category: 'food',          type: 'expense' },
  { id: generateId(), date: '2026-03-25', description: 'Investment Return',       amount:  420.00, category: 'investment',    type: 'income'  },
  { id: generateId(), date: '2026-03-28', description: 'Taxi Ride',               amount:   25.00, category: 'transport',     type: 'expense' },
  { id: generateId(), date: '2026-03-30', description: 'Phone Bill',              amount:   55.00, category: 'bills',         type: 'expense' },

  /* ── April 2026 ─────────────────────────────────── */
  { id: generateId(), date: '2026-04-01', description: 'Monthly Salary', amount: 5400.00, category: 'salary', type: 'income' },
];
