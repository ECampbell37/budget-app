# 💸 Smart Budget

An easy-to-use budgeting tool built with Next.js and Tailwind CSS that helps users track monthly income, expenses, savings, and investments while comparing spending against recommended budget targets.

## 🔗 Live Demo

Try Smart Budget here:

[https://budget-app-smoky-zeta.vercel.app](https://budget-app-smoky-zeta.vercel.app/)


## Features

### 📊 Budget Overview

- Track monthly income
- Monitor total spending
- View remaining money after expenses
- See remaining percentage of income
- Visual budget usage progress bar
- Set custom recommended percentages

### 🏠 Needs vs ✨ Wants

Expenses are organized into two easy-to-understand categories.

#### Needs

- Housing & Utilities
- Food & Groceries
- Transportation
- Insurance
- Debt Payments

#### Wants

- Savings
- Investments
- Personal Spending

### 🎯 Smart Recommendations

Each category includes a recommended percentage of income.

Examples:

- Housing: 40%
- Food: 22.5%
- Savings: 15%
- Investments: 5%

Recommendations are displayed as both:

- Percentage of income
- Dollar amount based on the user's entered income

Example:

```text
Recommended: 15% of income (In your case: $630)
```

### 🚦 Visual Budget Health Indicators

The app provides color-coded feedback to help users quickly identify budget imbalances.

#### Spending Categories (Needs & Personal Spending)

🟢 Green
- Within recommended target

🟡 Yellow
- Slightly above target

🟠 Orange
- Moderately above target

🔴 Red
- Significantly above target

#### Growth Categories (Savings & Investments)

🟢 Green
- Meeting or exceeding target

🟡 Yellow
- Slightly below target

🟠 Orange
- Moderately below target

🔴 Red
- Significantly below target

### 💾 Automatic Saving

Budget data is automatically saved in the browser using Local Storage.

Benefits:

- No account required
- No backend required
- No database required
- Data persists between visits on the same device

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Local Storage

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build for Production

```bash
npm run build
```

Run the production build locally:

```bash
npm start
```

## Deployment

This project is optimized for deployment on Vercel.

Deploy by connecting the GitHub repository to Vercel or using:

```bash
vercel
```

Once deployed, each user maintains their own budget data through browser Local Storage.

## Future Ideas

- Custom budget categories
- Editable recommendation percentages ✅
- Settings tab ✅
- Dark/light mode toggle
- Charts and spending breakdowns
- Monthly budget history
- Export to PDF or CSV

## Why I Built This

Smart Budget was created as a simple and free budgeting tool that provides immediate feedback on spending habits without requiring account creation, subscriptions, or any complicated setup. The goal is to help users quickly understand where their money is going and whether their spending aligns with common budgeting recommendations. I personally use this app to plan out my budget!

## License

MIT License

Feel free to use, modify, and share this project.
