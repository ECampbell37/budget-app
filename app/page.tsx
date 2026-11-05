// Home Page

"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Percent, 
  Home as HomeIcon, 
  Utensils, 
  Car, 
  ShieldCheck, 
  PiggyBank, 
  User, 
  BarChart3,
  Briefcase,
  Coins,
  CreditCard,
  Gem,
  Settings,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Plus
} from "lucide-react";

interface BudgetConfig {
  name: string;
  type: "Essential" | "Lifestyle";
  target: number;
  metric: "max" | "min";
  icon: any;
  description: string;
}

interface BreakdownItem {
  id: string;
  name: string;
  amount: string;
}

type Breakdowns = Record<string, BreakdownItem[]>;

const BUDGET_CONFIGS: BudgetConfig[] = [
  { name: "Housing & Utilities", type: "Essential", target: 40, metric: "max", icon: HomeIcon, description: "Rent/mortgage, electric, water, HVAC, internet, phone bills" },
  { name: "Food & Groceries", type: "Essential", target: 22.5, metric: "max", icon: Utensils, description: "Everyday meals, groceries, household supplies" },
  { name: "Transportation", type: "Essential", target: 5, metric: "max", icon: Car, description: "Gas, maintenance, public transit, tolls, parking" },
  { name: "Insurance", type: "Essential", target: 7.5, metric: "max", icon: ShieldCheck, description: "Health, auto, home, and other insurance premiums" },
  { name: "Debt Payments", type: "Essential", target: 0, metric: "max", icon: CreditCard, description: "Student loans, credit cards, car loans, personal loans" },
  { name: "Savings", type: "Lifestyle", target: 15, metric: "min", icon: PiggyBank, description: "Personal savings, emergency fund, HYSA" },
  { name: "Personal", type: "Lifestyle", target: 5, metric: "max", icon: User, description: "Subscriptions, clothes, entertainment, hobbies" },
  { name: "Investments", type: "Lifestyle", target: 5, metric: "min", icon: TrendingUp, description: "401k, Roth IRA, Brokerage investments" },
];

const DEFAULT_TARGETS: Record<string, number> = BUDGET_CONFIGS.reduce(
  (acc, item) => ({ ...acc, [item.name]: item.target }),
  {}
);

// Suggested items per category, shown as quick-add chips. Every category also
// gets an "Add your own" chip. Keys must match the BUDGET_CONFIGS names.
const SUBCATEGORY_PRESETS: Record<string, string[]> = {
  "Housing & Utilities": ["Rent/Mortgage", "Electric", "Wifi"],
  "Food & Groceries": ["Grocery Store", "Online Orders", "Takeout"],
  "Transportation": ["Gas", "Parking", "Public Transit"],
  "Insurance": ["Health", "Home", "Auto"],
  "Debt Payments": ["Student Loans", "Credit Cards", "Car Loan"],
  "Savings": ["Emergency Fund", "High-Yield Savings", "Personal Savings"],
  "Personal": ["Gym", "Clothes", "Music", "Nights Out", "Movies & Shows"],
  "Investments": ["401(k)", "Roth IRA", "Brokerage"],
};

// Suggested income sources for the Monthly Income box.
const INCOME_PRESETS = ["Main Job", "Side Income", "Dividends"];

const MARQUEE_ICONS = [
  Wallet, DollarSign, PiggyBank, BarChart3, TrendingUp, Percent, 
  Briefcase, Coins, CreditCard, Gem, HomeIcon, Utensils
];

const makeId = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

// Used when loading saved items from localStorage.
const isBreakdownItem = (row: any): row is BreakdownItem =>
  !!row &&
  typeof row.id === "string" &&
  typeof row.name === "string" &&
  typeof row.amount === "string";

// Only rows with an amount above zero count toward the total. Until at
// least one does, the field falls back to its manually entered amount.
function summarizeBreakdown(items: BreakdownItem[] = []) {
  let count = 0;
  let total = 0;
  items.forEach((row) => {
    const value = parseFloat(row.amount) || 0;
    if (value > 0) {
      count += 1;
      total += value;
    }
  });
  return { count, total: Math.round(total * 100) / 100 };
}

export default function Home() {
  const [income, setIncome] = useState<string>("");
  const [incomeSources, setIncomeSources] = useState<BreakdownItem[]>([]);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenses, setExpenses] = useState<Record<string, string>>(() => 
    BUDGET_CONFIGS.reduce((acc, item) => ({ ...acc, [item.name]: "" }), {})
  );
  const [breakdowns, setBreakdowns] = useState<Breakdowns>({});
  const [targets, setTargets] = useState<Record<string, number>>(DEFAULT_TARGETS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftTargets, setDraftTargets] = useState<Record<string, number>>(DEFAULT_TARGETS);
  const [incomeFocused, setIncomeFocused] = useState(false);

  // Controls the centered confirmation pop-up for the header Reset button.
  const [resetConfirming, setResetConfirming] = useState(false);

  // Tracks whether we've finished checking localStorage on mount. Until this
  // is true, we don't know if the user already has saved income, so we
  // suppress the "Start here" prompt UI to avoid a flash on refresh.
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("budget-data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.income) setIncome(data.income);
        if (data.expenses) {
          setExpenses((prev) => {
            const merged = { ...prev };
            BUDGET_CONFIGS.forEach((item) => {
              if (typeof data.expenses[item.name] === "string") {
                merged[item.name] = data.expenses[item.name];
              }
            });
            return merged;
          });
        }
      } catch (e) {
        console.error("Failed to parse local storage budget data", e);
      }
    }

    const savedTargets = localStorage.getItem("budget-targets");
    if (savedTargets) {
      try {
        const data = JSON.parse(savedTargets);
        const merged = { ...DEFAULT_TARGETS };
        BUDGET_CONFIGS.forEach((item) => {
          if (typeof data[item.name] === "number") {
            merged[item.name] = data[item.name];
          }
        });
        setTargets(merged);
        setDraftTargets(merged);
      } catch (e) {
        console.error("Failed to parse local storage budget targets", e);
      }
    }

    const savedBreakdowns = localStorage.getItem("budget-breakdowns");
    if (savedBreakdowns) {
      try {
        const data = JSON.parse(savedBreakdowns);
        const merged: Breakdowns = {};
        BUDGET_CONFIGS.forEach((item) => {
          const rows = data[item.name];
          if (Array.isArray(rows)) {
            merged[item.name] = rows.filter(isBreakdownItem);
          }
        });
        setBreakdowns(merged);
      } catch (e) {
        console.error("Failed to parse local storage budget breakdowns", e);
      }
    }

    const savedIncomeSources = localStorage.getItem("budget-income-sources");
    if (savedIncomeSources) {
      try {
        const data = JSON.parse(savedIncomeSources);
        if (Array.isArray(data)) {
          setIncomeSources(data.filter(isBreakdownItem));
        }
      } catch (e) {
        console.error("Failed to parse local storage income sources", e);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("budget-data", JSON.stringify({ income, expenses }));
  }, [income, expenses]);

  // Breakdowns and income sources are saved separately from budget-data so
  // the existing saved shape is untouched. We wait for hydration so we never
  // overwrite saved items with the empty initial state.
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("budget-breakdowns", JSON.stringify(breakdowns));
  }, [breakdowns, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("budget-income-sources", JSON.stringify(incomeSources));
  }, [incomeSources, isHydrated]);

  // Lock background scroll while the settings panel is open, and let the
  // panel itself own its scroll region. Without this, touch/wheel input
  // over the backdrop keeps scrolling the page behind the panel.
  useEffect(() => {
    if (settingsOpen) {
      const previousOverflow = document.body.style.overflow;
      const previousPaddingRight = document.body.style.paddingRight;

      // Prevent layout shift from the disappearing scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      };
    }
  }, [settingsOpen]);

  // Let Escape dismiss the reset pop-up.
  useEffect(() => {
    if (!resetConfirming) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResetConfirming(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resetConfirming]);

  // Income is the sum of the income sources when any have amounts,
  // otherwise the manually entered value.
  const { count: incomeSourceCount, total: incomeSourceTotal } = summarizeBreakdown(incomeSources);
  const isIncomeBreakdownActive = incomeSourceCount > 0;
  const parsedIncome = isIncomeBreakdownActive ? incomeSourceTotal : parseFloat(income) || 0;
  const hasIncome = parsedIncome > 0;

  // Only show the "enter your income" prompt UI once we've confirmed (post
  // hydration) that the user genuinely has no saved income yet.
  const showIncomePrompt = isHydrated && !hasIncome;

  // The amount each category contributes: the item total when the category
  // has items with amounts, otherwise the manually entered value.
  const categoryAmounts = useMemo(() => {
    const result: Record<string, number> = {};
    BUDGET_CONFIGS.forEach((item) => {
      const { count, total } = summarizeBreakdown(breakdowns[item.name]);
      result[item.name] = count > 0 ? total : parseFloat(expenses[item.name]) || 0;
    });
    return result;
  }, [expenses, breakdowns]);

  const totalSpent = useMemo(() =>
    Object.values(categoryAmounts).reduce((sum, value) => sum + value, 0),
    [categoryAmounts]
  );

  const moneyLeft = parsedIncome - totalSpent;
  const remainingPercent = parsedIncome > 0 ? ((moneyLeft / parsedIncome) * 100).toFixed(1) : "0";
  const usagePercent = parsedIncome > 0 ? (totalSpent / parsedIncome) * 100 : 0;

  const essentials = BUDGET_CONFIGS.filter((item) => item.type === "Essential");
  const lifestyle = BUDGET_CONFIGS.filter((item) => item.type === "Lifestyle");

  const updateExpense = (name: string, value: string) => {
    setExpenses((prev) => ({ ...prev, [name]: value }));
  };

  const updateBreakdown = (name: string, items: BreakdownItem[]) => {
    setBreakdowns((prev) => ({ ...prev, [name]: items }));
  };

  // Clears all budget data (income, income sources, category amounts and
  // item breakdowns). The save effects above write the empty values back to
  // localStorage. Custom percentage targets are left alone on purpose, since
  // those are settings rather than budget data.
  const resetBudget = () => {
    setIncome("");
    setIncomeSources([]);
    setIncomeOpen(false);
    setExpenses(BUDGET_CONFIGS.reduce((acc, item) => ({ ...acc, [item.name]: "" }), {}));
    setBreakdowns({});
    setResetConfirming(false);
  };

  const draftSum = useMemo(
    () => Object.values(draftTargets).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [draftTargets]
  );
  const draftSumRounded = Math.round(draftSum * 10) / 10;
  const isDraftValid = draftSumRounded === 100;

  const openSettings = () => {
    setDraftTargets(targets);
    setSettingsOpen(true);
  };

  const updateDraftTarget = (name: string, value: string) => {
    const num = value === "" ? 0 : parseFloat(value);
    setDraftTargets((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  };

  const saveTargets = () => {
    if (!isDraftValid) return;
    setTargets(draftTargets);
    localStorage.setItem("budget-targets", JSON.stringify(draftTargets));
    setSettingsOpen(false);
  };

  const resetTargets = () => {
    setDraftTargets(DEFAULT_TARGETS);
  };

  return (
    <main className="min-h-screen relative text-slate-50 antialiased overflow-x-hidden selection:bg-indigo-500/30">

      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 animate-gradient" />

      {/* Primary div */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-12">
        
        {/* Main Dashboard Header */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner animate-float">
                <Wallet className="w-8 h-8" />
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent py-2">
                Smart Budget
              </h1>
            </div>
            <p className="text-slate-300 text-base sm:text-xl font-medium">
              Track your monthly income and spending.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setResetConfirming(true)}
              aria-label="Reset budget"
              title="Reset budget"
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-red-400 hover:border-slate-700 transition-all shadow-xl backdrop-blur-sm"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={openSettings}
              aria-label="Open settings"
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 hover:border-slate-700 transition-all shadow-xl backdrop-blur-sm"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* MOBILE MARQUEE */}
        <div className="block md:hidden w-full overflow-hidden relative bg-slate-900/40 rounded-full border-y border-slate-800/60 py-3 mb-10 backdrop-blur-sm">
          <div className="flex animate-marquee-mobile gap-12 whitespace-nowrap min-w-full">
            <div className="flex shrink-0 items-center gap-12 text-slate-500/40">
              {MARQUEE_ICONS.map((Icon, idx) => <Icon key={`mob1-${idx}`} className="w-5 h-5" />)}
            </div>
            <div className="flex shrink-0 items-center gap-12 text-slate-500/40" aria-hidden="true">
              {MARQUEE_ICONS.map((Icon, idx) => <Icon key={`mob2-${idx}`} className="w-5 h-5" />)}
            </div>
          </div>
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none opacity-50" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none opacity-50" />
        </div>

        {/* DESKTOP MARQUEE */}
        <div className="hidden md:block w-full overflow-hidden relative bg-slate-900/40 rounded-full border-y border-slate-800/60 py-3 mb-10 backdrop-blur-sm">
          <div className="flex w-[200%] animate-marquee gap-12 items-center">
            <div className="flex justify-around w-1/2 gap-12 text-slate-500/40 shrink-0">
              {MARQUEE_ICONS.map((Icon, idx) => <Icon key={`d1-${idx}`} className="w-5 h-5 hover:text-indigo-400 transition-colors" />)}
            </div>
            <div className="flex justify-around w-1/2 gap-12 text-slate-500/40 shrink-0">
              {MARQUEE_ICONS.map((Icon, idx) => <Icon key={`d2-${idx}`} className="w-5 h-5 hover:text-indigo-400 transition-colors" />)}
            </div>
          </div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none opacity-50" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none opacity-50" />
        </div>

        {/* Starting Hint Pop-up */}
        <div
          className={`relative bg-slate-900 border rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm transition-all duration-300 ${
            showIncomePrompt
              ? "border-indigo-500/60 animate-pulse-ring"
              : "border-slate-800"
          }`}
        >
          {showIncomePrompt && (
            <div className="absolute -top-3.5 left-6 flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-bold pl-2.5 pr-3 py-1.5 rounded-full shadow-lg shadow-indigo-500/40 animate-badge-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              Start here
            </div>
          )}

          <label className="flex flex-wrap items-center gap-2 text-slate-400 mb-2 font-medium">
            Monthly Income
            {showIncomePrompt && (
              <span className="text-indigo-400 text-sm font-normal">
                — enter your take-home pay to start calculating your budget
              </span>
            )}
          </label>

          <div className="flex items-center gap-3">
            <div className="flex items-stretch gap-2 max-w-md flex-1">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">$</span>
                <input
                  type="number"
                  value={isIncomeBreakdownActive ? String(incomeSourceTotal) : income}
                  onChange={(e) => setIncome(e.target.value)}
                  onFocus={() => setIncomeFocused(true)}
                  onBlur={() => setIncomeFocused(false)}
                  onWheel={(e) => e.currentTarget.blur()}
                  readOnly={isIncomeBreakdownActive}
                  placeholder="4000"
                  className={`w-full bg-slate-800 border rounded-xl pl-8 pr-4 py-3 text-lg outline-none transition-all ${
                    showIncomePrompt && !incomeFocused
                      ? "border-indigo-500/50 focus:border-indigo-500"
                      : "border-slate-700 focus:border-indigo-500"
                  } ${isIncomeBreakdownActive ? "text-slate-300 cursor-default" : ""}`}
                />
              </div>

              <BreakdownToggle
                open={incomeOpen}
                onToggle={() => setIncomeOpen((prev) => !prev)}
                count={incomeSourceCount}
                name="Monthly Income"
              />
            </div>
            {showIncomePrompt && (
              <ArrowRight className="w-5 h-5 text-indigo-400 shrink-0 hidden sm:block animate-nudge-right" />
            )}
          </div>

          {isIncomeBreakdownActive && (
            <p className="text-indigo-400/80 text-xs mt-2 ml-1">
              Calculated Income
            </p>
          )}

          {incomeOpen && (
            <div className="max-w-md mt-3">
              <BreakdownPanel
                items={incomeSources}
                presets={INCOME_PRESETS}
                onChange={setIncomeSources}
              />
            </div>
          )}
        </div>

        {/* Row of metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard title="Income" value={`$${parsedIncome.toFixed(0)}`} icon={DollarSign} />
          <SummaryCard title="Spent" value={`$${totalSpent.toFixed(0)}`} icon={BarChart3} />
          <SummaryCard 
            title="Remaining" 
            value={`$${moneyLeft.toFixed(0)}`} 
            icon={TrendingUp}
            color={moneyLeft >= 0 ? "text-emerald-400" : "text-red-400"} 
          />
          <SummaryCard title="Remaining %" value={`${remainingPercent}%`} icon={Percent} />
        </div>

        {/* Total Budget Usage Meter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between mb-3 text-lg font-medium">
            <span>Budget Usage</span>
            <span
              className={
                usagePercent > 100
                  ? "text-red-400"
                  : usagePercent >= 95
                  ? "text-blue-400"
                  : "text-emerald-400"
              }
            >
              {usagePercent.toFixed(1)}%
            </span>
          </div>

          <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-[2px] border border-slate-700/30">
            <div
              className={`h-full rounded-full animated-progress-fill transition-all duration-500 ease-out ${
                usagePercent > 100
                  ? "bg-[linear-gradient(90deg,#ef4444_0%,#b91c1c_50%,#ef4444_100%)]"
                  : usagePercent > 98
                  ? "bg-[linear-gradient(90deg,#3b82f6_0%,#1d4ed8_50%,#3b82f6_100%)]"
                  : "bg-[linear-gradient(90deg,#10b981_0%,#047857_50%,#10b981_100%)]"
              }`}
              style={{
                width: `${Math.min(usagePercent, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Essentials Group */}
        <h2 className="text-3xl font-bold mb-5 tracking-tight">🏠 Needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {essentials.map((item) => (
            <ExpenseCard
              key={item.name}
              item={item}
              target={targets[item.name] ?? item.target}
              income={parsedIncome}
              value={expenses[item.name]}
              onChange={updateExpense}
              breakdown={breakdowns[item.name] ?? []}
              onBreakdownChange={updateBreakdown}
            />
          ))}
        </div>

        <br></br>

        {/* Lifestyle Group */}
        <h2 className="text-3xl font-bold mb-5 tracking-tight">✨ Wants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifestyle.map((item) => (
            <ExpenseCard
              key={item.name}
              item={item}
              target={targets[item.name] ?? item.target}
              income={parsedIncome}
              value={expenses[item.name]}
              onChange={updateExpense}
              breakdown={breakdowns[item.name] ?? []}
              onBreakdownChange={updateBreakdown}
            />
          ))}
        </div>
      </div>

      {/* Reset Confirmation Pop-up */}
      {resetConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setResetConfirming(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </span>
              <h3 id="reset-title" className="text-xl font-bold tracking-tight">
                Reset your Budget?
              </h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              This removes your entered income, category amounts, and all calculated values. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResetConfirming(false)}
                className="flex-1 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl py-3 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={resetBudget}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white rounded-xl py-3 font-semibold transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel Overlay */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overscroll-contain">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto overscroll-contain animate-panel-in">
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Customize Percentages</h3>
                <p className="text-slate-400 text-sm mt-1">Set your own recommended percentages.</p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {BUDGET_CONFIGS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="p-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="font-semibold text-slate-100 truncate">{item.name}</span>
                      </div>
                      <div className="relative w-24 shrink-0">
                        <input
                          type="number"
                          value={draftTargets[item.name] ?? 0}
                          onChange={(e) => updateDraftTarget(item.name, e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-7 py-2 text-right outline-none transition-all focus:border-indigo-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div
                className={`flex items-center justify-between rounded-xl p-4 border ${
                  isDraftValid
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {isDraftValid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>Total: {draftSumRounded}%</span>
                </div>
                {!isDraftValid && <span className="text-xs">Must equal exactly 100%</span>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetTargets}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl py-3 font-medium transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={saveTargets}
                  disabled={!isDraftValid}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ title, value, color = "text-white", icon: Icon }: { title: string; value: string; color?: string; icon: any }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all duration-300 backdrop-blur-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// The small "+" button that sits next to an amount input. Shared by the
// income box and the category cards. Shows a quiet count badge when the
// panel is closed but items are in use.
function BreakdownToggle({
  open,
  onToggle,
  count,
  name,
}: {
  open: boolean;
  onToggle: () => void;
  count: number;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? `Hide ${name} items` : `Add items to ${name}`}
      title={open ? "Hide items" : "Add items"}
      className="relative shrink-0 w-12 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-indigo-400 hover:border-slate-600 transition-all"
    >
      <Plus className={`w-5 h-5 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      {count > 0 && !open && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

// The expandable list of items (rows plus quick-add chips). Shared by the
// income box and the category cards. It only mounts while open, so its focus
// state resets each time the panel is reopened.
function BreakdownPanel({
  items,
  presets,
  onChange,
}: {
  items: BreakdownItem[];
  presets: string[];
  onChange: (items: BreakdownItem[]) => void;
}) {
  const [focusTarget, setFocusTarget] = useState<{ id: string; field: "name" | "amount" } | null>(null);

  const availablePresets = presets.filter(
    (preset) =>
      !items.some((row) => row.name.trim().toLowerCase() === preset.toLowerCase())
  );

  const addRow = (name: string) => {
    const row: BreakdownItem = { id: makeId(), name, amount: "" };
    onChange([...items, row]);
    // Presets focus the amount, custom rows focus the name.
    setFocusTarget({ id: row.id, field: name ? "amount" : "name" });
  };

  const updateRow = (id: string, patch: Partial<BreakdownItem>) => {
    onChange(items.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    onChange(items.filter((row) => row.id !== id));
  };

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-800 p-3">
      {items.length === 0 && (
        <p className="text-slate-500 text-xs mb-3">
          Pick an item below and we'll add it up for you.
        </p>
      )}

      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <input
                type="text"
                value={row.name}
                maxLength={30}
                placeholder="Name"
                aria-label="Item name"
                autoFocus={focusTarget?.id === row.id && focusTarget.field === "name"}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                className="w-full min-w-0 flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500"
              />
              <div className="relative w-24 sm:w-28 shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  value={row.amount}
                  placeholder="0"
                  aria-label={`${row.name || "Item"} amount`}
                  autoFocus={focusTarget?.id === row.id && focusTarget.field === "amount"}
                  onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-2 py-2 text-sm outline-none transition-all focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label={`Remove ${row.name || "item"}`}
                className="shrink-0 p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {availablePresets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => addRow(preset)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500/60 hover:text-indigo-300 transition-all"
          >
            <Plus className="w-3 h-3" />
            {preset}
          </button>
        ))}
        <button
          type="button"
          onClick={() => addRow("")}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border border-dashed border-slate-700 text-slate-400 hover:border-indigo-500/60 hover:text-indigo-300 transition-all"
        >
          <Plus className="w-3 h-3" />
          Add your own
        </button>
      </div>
    </div>
  );
}

function ExpenseCard({
  item,
  target,
  income,
  value,
  onChange,
  breakdown,
  onBreakdownChange,
}: {
  item: BudgetConfig;
  target: number;
  income: number;
  value: string;
  onChange: (name: string, value: string) => void;
  breakdown: BreakdownItem[];
  onBreakdownChange: (name: string, items: BreakdownItem[]) => void;
}) {
  // Expanded/collapsed isn't persisted on purpose, cards always start collapsed.
  const [open, setOpen] = useState(false);

  const { count: activeCount, total: breakdownTotal } = summarizeBreakdown(breakdown);
  const isBreakdownActive = activeCount > 0;

  const amount = isBreakdownActive ? breakdownTotal : parseFloat(value) || 0;
  const percentNumber = income > 0 ? (amount / income) * 100 : 0;
  const percent = percentNumber.toFixed(1);
  const Icon = item.icon;

  let statusColor;
  let gradientFill;

  if (item.metric === "max") {
    if (percentNumber <= target) {
      statusColor = "text-emerald-400";
      gradientFill = "bg-[linear-gradient(90deg,#10b981_0%,#059669_50%,#10b981_100%)]";
    } else if (percentNumber <= target * 1.2) {
      statusColor = "text-yellow-400";
      gradientFill = "bg-[linear-gradient(90deg,#f59e0b_0%,#d97706_50%,#f59e0b_100%)]";
    } else if (percentNumber <= target * 1.5) {
      statusColor = "text-orange-400";
      gradientFill = "bg-[linear-gradient(90deg,#f97316_0%,#ea580c_50%,#f97316_100%)]";
    } else {
      statusColor = "text-red-400";
      gradientFill = "bg-[linear-gradient(90deg,#ef4444_0%,#dc2626_50%,#ef4444_100%)]";
    }
  } else {
    if (percentNumber >= target) {
      statusColor = "text-emerald-400";
      gradientFill = "bg-[linear-gradient(90deg,#10b981_0%,#059669_50%,#10b981_100%)]";
    } else if (percentNumber >= target * 0.8) {
      statusColor = "text-yellow-400";
      gradientFill = "bg-[linear-gradient(90deg,#f59e0b_0%,#d97706_50%,#f59e0b_100%)]";
    } else if (percentNumber >= target * 0.5) {
      statusColor = "text-orange-400";
      gradientFill = "bg-[linear-gradient(90deg,#f97316_0%,#ea580c_50%,#f97316_100%)]";
    } else {
      statusColor = "text-red-400";
      gradientFill = "bg-[linear-gradient(90deg,#ef4444_0%,#dc2626_50%,#ef4444_100%)]";
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between backdrop-blur-sm">
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl">
              <Icon className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-xl text-slate-100 tracking-tight">{item.name}</h3>
          </div>
          <span className={`text-xl font-extrabold ${statusColor}`}>{percent}%</span>
        </div>

        <p className="text-slate-500 text-xs sm:text-sm ml-[42px] mb-4">
          {item.description}
        </p>

        <div className="mb-4">
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={isBreakdownActive ? String(breakdownTotal) : value}
                onChange={(e) => onChange(item.name, e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                readOnly={isBreakdownActive}
                className={`w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-base outline-none transition-all font-medium ${
                  isBreakdownActive ? "text-slate-300 cursor-default" : ""
                }`}
              />
            </div>

            <BreakdownToggle
              open={open}
              onToggle={() => setOpen((prev) => !prev)}
              count={activeCount}
              name={item.name}
            />
          </div>

          {isBreakdownActive && (
            <p className="text-indigo-400/80 text-xs mt-2 ml-1">
              Calculated Total
            </p>
          )}
        </div>

        {open && (
          <div className="mb-4">
            <BreakdownPanel
              items={breakdown}
              presets={SUBCATEGORY_PRESETS[item.name] ?? []}
              onChange={(next) => onBreakdownChange(item.name, next)}
            />
          </div>
        )}

        <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-800/40">
          <div
            className={`h-full rounded-full animated-progress-fill transition-all duration-300 ease-out ${gradientFill}`}
            style={{ width: `${Math.min(percentNumber, 100)}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-slate-300 text-base font-medium mt-4">
          {percent}% of income
        </p>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
          Recommended: {target}% of income (In your case: ${(income * (target / 100)).toFixed(0)})
        </p>
      </div>
    </div>
  );
}