"use client";

import { useEffect, useMemo, useState } from "react";

const EXPENSES = [
  { name: "Housing", type: "Essential", target: 35, metric: "max" },
  { name: "Food", type: "Essential", target: 20, metric: "max" },
  { name: "Transportation", type: "Essential", target: 10, metric: "max" },
  { name: "Insurance", type: "Essential", target: 5, metric: "max" },

  { name: "Savings", type: "Lifestyle", target: 15, metric: "min" },
  { name: "Personal", type: "Lifestyle", target: 10, metric: "max" },
  { name: "Investments", type: "Lifestyle", target: 5, metric: "min" },
];

export default function Home() {
  const [income, setIncome] = useState("4200");

  const [expenses, setExpenses] = useState<Record<string, string>>(
    EXPENSES.reduce((acc, item) => {
      acc[item.name] = "";
      return acc;
    }, {} as Record<string, string>)
  );

  useEffect(() => {
    const saved = localStorage.getItem("budget-data");

    if (saved) {
      const data = JSON.parse(saved);

      setIncome(data.income || "4200");
      setExpenses(data.expenses || {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "budget-data",
      JSON.stringify({
        income,
        expenses,
      })
    );
  }, [income, expenses]);

  const parsedIncome = parseFloat(income) || 0;

  const totalSpent = useMemo(
    () =>
      Object.values(expenses).reduce(
        (sum, value) => sum + (parseFloat(value) || 0),
        0
      ),
    [expenses]
  );

  const moneyLeft = parsedIncome - totalSpent;

  const remainingPercent =
    parsedIncome > 0
      ? ((moneyLeft / parsedIncome) * 100).toFixed(1)
      : "0";

  const usagePercent =
    parsedIncome > 0
      ? (totalSpent / parsedIncome) * 100
      : 0;

  const essentials = EXPENSES.filter(
    (item) => item.type === "Essential"
  );

  const lifestyle = EXPENSES.filter(
    (item) => item.type === "Lifestyle"
  );

  const updateExpense = (name: string, value: string) => {
    setExpenses((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-5xl font-bold mb-2">
          💸 Smart Budget
        </h1>

        <p className="text-slate-400 mb-8">
          Track your monthly income and spending.
        </p>

        {/* Income Input */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <label className="block text-slate-400 mb-2">
            Monthly Income
          </label>

          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg outline-none"
          />
        </div>

        {/* Summary Cards */}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Income"
            value={`$${parsedIncome.toFixed(0)}`}
          />

          <SummaryCard
            title="Spent"
            value={`$${totalSpent.toFixed(0)}`}
          />

          <SummaryCard
            title="Remaining"
            value={`$${moneyLeft.toFixed(0)}`}
            color={
              moneyLeft >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }
          />

          <SummaryCard
            title="Remaining %"
            value={`${remainingPercent}%`}
          />
        </div>

        {/* Budget Usage */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">
          <div className="flex justify-between mb-3">
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

          <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                usagePercent > 100
                  ? "bg-red-500"
                  : usagePercent > 98
                  ? "bg-blue-500"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(usagePercent, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Essentials */}

        <SectionTitle title="🏠 Needs" />

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

        {/* Lifestyle */}

        <SectionTitle title="✨ Wants" />

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

function SummaryCard({
  title,
  value,
  color = "text-white",
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-slate-400 text-sm mb-2">
        {title}
      </p>

      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <h2 className="text-2xl font-semibold mb-4">
      {title}
    </h2>
  );
}

function ExpenseCard({
  item,
  income,
  value,
  onChange,
}: {
  item: {
    name: string;
    type: string;
    target: number;
    metric: string;
  };
  income: number;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  const amount = parseFloat(value) || 0;

  const percentNumber =
    income > 0
      ? (amount / income) * 100
      : 0;

  const percent = percentNumber.toFixed(1);

  let statusColor;
  let progressColor;

  if (item.metric === "max") {
    if (percentNumber <= item.target) {
      statusColor = "text-emerald-400";
      progressColor = "bg-emerald-500";
    } else if (percentNumber <= item.target * 1.2) {
      statusColor = "text-yellow-400";
      progressColor = "bg-yellow-500";
    } else if (percentNumber <= item.target * 1.5) {
      statusColor = "text-orange-400";
      progressColor = "bg-orange-500";
    } else {
      statusColor = "text-red-400";
      progressColor = "bg-red-500";
    }
  } else {
    if (percentNumber >= item.target) {
      statusColor = "text-emerald-400";
      progressColor = "bg-emerald-500";
    } else if (percentNumber >= item.target * 0.8) {
      statusColor = "text-yellow-400";
      progressColor = "bg-yellow-500";
    } else if (percentNumber >= item.target * 0.5) {
      statusColor = "text-orange-400";
      progressColor = "bg-orange-500";
    } else {
      statusColor = "text-red-400";
      progressColor = "bg-red-500";
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-lg">
          {item.name}
        </h3>

        <span className={statusColor}>
          {percent}%
        </span>
      </div>

      <input
        type="number"
        placeholder="Enter amount"
        value={value}
        onChange={(e) =>
          onChange(item.name, e.target.value)
        }
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-4 outline-none"
      />

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor}`}
          style={{
            width: `${Math.min(
              percentNumber,
              100
            )}%`,
          }}
        />
      </div>

      <p className="text-slate-400 text-sm mt-3">
        {percent}% of income
      </p>

      <p className="text-slate-500 text-xs mt-1">
        Recommended: {item.target}% of income (In your case: 
        ${(income * (item.target / 100)).toFixed(0)})
      </p>
    </div>
  );
}