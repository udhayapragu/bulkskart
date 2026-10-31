import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator } from 'lucide-react';
import { formatMoney } from '@/lib/homepageData';

const TENURES = [3, 6, 9, 12, 18, 24, 36];
const RATES = [10, 12, 14, 16, 18];

/** Standard EMI: P * r * (1 + r)^n / ((1 + r)^n - 1), with r the monthly rate. */
function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  const rate = annualRatePercent / 12 / 100;
  if (rate === 0) return principal / months;
  const growth = (1 + rate) ** months;
  return (principal * rate * growth) / (growth - 1);
}

export default function LoanCalculatorCard() {
  const [orderValue, setOrderValue] = useState(250000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(12);
  const payment = monthlyPayment(orderValue, rate, months);

  return (
    <section aria-label="Order loan calculator" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <div className="grid items-center gap-5 rounded-2xl border border-border bg-card/70 p-4 sm:p-6 lg:grid-cols-[1.1fr_1.6fr_1fr] lg:gap-8">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Calculator className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">Order Loan Calculator</h2>
            <p className="text-sm text-muted-foreground">Plan your bulk order as a monthly payment.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="loan-value" className="text-xs text-muted-foreground">
              Order Value
            </label>
            <p className="text-lg font-black tabular-nums text-foreground">{formatMoney(orderValue, 'INR')}</p>
            <input
              id="loan-value"
              type="range"
              min={10000}
              max={5000000}
              step={10000}
              value={orderValue}
              onChange={(event) => setOrderValue(Number(event.target.value))}
              className="mt-1 h-2 w-full cursor-pointer accent-[#FF5A00]"
            />
          </div>
          <div>
            <label htmlFor="loan-tenure" className="text-xs text-muted-foreground">
              Tenure
            </label>
            <select
              id="loan-tenure"
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {TENURES.map((value) => (
                <option key={value} value={value}>
                  {value} Months
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="loan-rate" className="text-xs text-muted-foreground">
              Annual Rate
            </label>
            <select
              id="loan-rate"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {RATES.map((value) => (
                <option key={value} value={value}>
                  {value}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch">
          <div>
            <p className="text-xs text-muted-foreground">Estimated Monthly Payment</p>
            <p className="text-2xl font-black tabular-nums text-primary">
              {formatMoney(Math.round(payment), 'INR')}
              <span className="ml-1 text-sm font-semibold text-muted-foreground">/ month</span>
            </p>
          </div>
          <Link
            to="/loan-calculator"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            Calculate Now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        Estimate for planning only. The rate is an example you can change, and the figure is not a credit approval.
      </p>
    </section>
  );
}
