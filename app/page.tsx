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
  Gem
} from "lucide-react";

interface BudgetConfig {
  name: string;
  type: "Essential" | "Lifestyle";
  target: number;
  metric: "max" | "min";
  icon: any;
}

const BUDGET_CONFIGS: BudgetConfig[] = [
  { name: "Housing", type: "Essential", target: 35, metric: "max", icon: HomeIcon },
  { name: "Food", type: "Essential", target: 20, metric: "max", icon: Utensils },
  { name: "Transportation", type: "Essential", target: 10, metric: "max", icon: Car },
  { name: "Insurance", type: "Essential", target: 5, metric: "max", icon: ShieldCheck },
  { name: "Savings", type: "Lifestyle", target: 15, metric: "min", icon: PiggyBank },
  { name: "Personal", type: "Lifestyle", target: 10, metric: "max", icon: User },
  { name: "Investments", type: "Lifestyle", target: 5, metric: "min", icon: TrendingUp },
];

const MARQUEE_ICONS = [
  Wallet, DollarSign, PiggyBank, BarChart3, TrendingUp, Percent, 
  Briefcase, Coins, CreditCard, Gem, HomeIcon, Utensils
];

export default function Home() {
  const [income, setIncome] = useState<string>("4200");
  const [expenses, setExpenses] = useState<Record<string, string>>(() => 
    BUDGET_CONFIGS.reduce((acc, item) => ({ ...acc, [item.name]: "" }), {})
  );

  useEffect(() => {
    const saved = localStorage.getItem("budget-data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.income) setIncome(data.income);
        if (data.expenses) setExpenses(data.expenses);
      } catch (e) {
        console.error("Failed to parse local storage budget data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("budget-data", JSON.stringify({ income, expenses }));
  }, [income, expenses]);

  const parsedIncome = parseFloat(income) || 0;

  const totalSpent = useMemo(() =>
    Object.values(expenses).reduce((sum, value) => sum + (parseFloat(value) || 0), 0),
    [expenses]
  );

  const moneyLeft = parsedIncome - totalSpent;
  const remainingPercent = parsedIncome > 0 ? ((moneyLeft / parsedIncome) * 100).toFixed(1) : "0";
  const usagePercent = parsedIncome > 0 ? (totalSpent / parsedIncome) * 100 : 0;

  const essentials = BUDGET_CONFIGS.filter((item) => item.type === "Essential");
  const lifestyle = BUDGET_CONFIGS.filter((item) => item.type === "Lifestyle");

  const updateExpense = (name: string, value: string) => {
    setExpenses((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen relative text-slate-50 antialiased overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Structural Styles for CSS Background Elements & Shimmer Tracks */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); box-shadow: 0 5px 15px 0 rgba(99, 102, 241, 0.15); }
          50% { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.3); }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeMobile {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }

        
        @keyframes progressShimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        
        .animate-gradient {
          background: linear-gradient(-45deg, #020617, #0f172a, #1e1b4b, #020617);
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-marquee { animation: marquee 35s linear infinite; }
        .animate-marquee-mobile { animation: marqueeMobile 20s linear infinite; }
        
        .animated-progress-fill {
          background-size: 200% auto !important;
          animation: progressShimmer 2.5s linear infinite;
        }
      `}} />

      {/* Dynamic Screen Backsplash Canvas */}
      <div className="absolute inset-0 z-0 animate-gradient" />

      {/* High-Capacity Frame Wrapper Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-12">
        
        {/* Main Dashboard Header (Sizing Increased) */}
        <header className="mb-8">
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
        </header>

        {/* 📱 MOBILE MARQUEE: Only visible on small screens (hidden md:flex) */}
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

        {/* 💻 DESKTOP MARQUEE: Hidden on mobile, flexes on desktop (hidden md:block) */}
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

        {/* Base Income Parameter Block Layout */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-sm">
          <label className="block text-slate-400 mb-2 font-medium">
            Monthly Income
          </label>
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">$</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-lg outline-none transition-all focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Summary Metric Scoreboard Panels */}
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

        {/* Aggregated Total Tracking Row Utilization Meter */}
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

        {/* Essentials Group Partition Blocks */}
        <h2 className="text-3xl font-bold mb-5 tracking-tight">🏠 Needs</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {essentials.map((item) => (
            <ExpenseCard
              key={item.name}
              item={item}
              income={parsedIncome}
              value={expenses[item.name]}
              onChange={updateExpense}
            />
          ))}
        </div>

        <br></br>

        {/* Lifestyle Group Partition Blocks */}
        <h2 className="text-3xl font-bold mb-5 tracking-tight">✨ Wants</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {lifestyle.map((item) => (
            <ExpenseCard
              key={item.name}
              item={item}
              income={parsedIncome}
              value={expenses[item.name]}
              onChange={updateExpense}
            />
          ))}
        </div>
      </div>
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

function ExpenseCard({
  item,
  income,
  value,
  onChange,
}: {
  item: BudgetConfig;
  income: number;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  const amount = parseFloat(value) || 0;
  const percentNumber = income > 0 ? (amount / income) * 100 : 0;
  const percent = percentNumber.toFixed(1);
  const Icon = item.icon;

  let statusColor;
  let gradientFill;

  if (item.metric === "max") {
    if (percentNumber <= item.target) {
      statusColor = "text-emerald-400";
      gradientFill = "bg-[linear-gradient(90deg,#10b981_0%,#059669_50%,#10b981_100%)]";
    } else if (percentNumber <= item.target * 1.2) {
      statusColor = "text-yellow-400";
      gradientFill = "bg-[linear-gradient(90deg,#f59e0b_0%,#d97706_50%,#f59e0b_100%)]";
    } else if (percentNumber <= item.target * 1.5) {
      statusColor = "text-orange-400";
      gradientFill = "bg-[linear-gradient(90deg,#f97316_0%,#ea580c_50%,#f97316_100%)]";
    } else {
      statusColor = "text-red-400";
      gradientFill = "bg-[linear-gradient(90deg,#ef4444_0%,#dc2626_50%,#ef4444_100%)]";
    }
  } else {
    if (percentNumber >= item.target) {
      statusColor = "text-emerald-400";
      gradientFill = "bg-[linear-gradient(90deg,#10b981_0%,#059669_50%,#10b981_100%)]";
    } else if (percentNumber >= item.target * 0.8) {
      statusColor = "text-yellow-400";
      gradientFill = "bg-[linear-gradient(90deg,#f59e0b_0%,#d97706_50%,#f59e0b_100%)]";
    } else if (percentNumber >= item.target * 0.5) {
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl">
              <Icon className="w-5 h-5" />
            </span>
            {/* Expanded section title size */}
            <h3 className="font-bold text-xl text-slate-100 tracking-tight">{item.name}</h3>
          </div>
          {/* Expanded section percentage display size */}
          <span className={`text-xl font-extrabold ${statusColor}`}>{percent}%</span>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
          <input
            type="number"
            placeholder="Enter amount"
            value={value}
            onChange={(e) => onChange(item.name, e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-base outline-none transition-all font-medium"
          />
        </div>

        <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-800/40">
          <div
            className={`h-full rounded-full animated-progress-fill transition-all duration-300 ease-out ${gradientFill}`}
            style={{ width: `${Math.min(percentNumber, 100)}%` }}
          />
        </div>
      </div>

      <div>
        {/* Expanded description content text sizing */}
        <p className="text-slate-300 text-base font-medium mt-4">
          {percent}% of income
        </p>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
          Recommended: {item.target}% of income (In your case: ${(income * (item.target / 100)).toFixed(0)})
        </p>
      </div>
    </div>
  );
}