'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Hotel, UtensilsCrossed, Ticket, Zap } from 'lucide-react';
import type { CostBreakdown as CostData } from '@/lib/api';

interface CostBreakdownProps {
  cost: CostData;
  days: number;
  tier: 'budget' | 'comfort' | 'luxury';
}

const costItems = [
  { key: 'hotelCost', label: 'Accommodation', icon: Hotel, color: 'bg-green-100 text-green-700' },
  { key: 'foodCost', label: 'Food & Dining', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-700' },
  { key: 'activityCost', label: 'Activities', icon: Ticket, color: 'bg-purple-100 text-purple-700' },
  { key: 'transportCost', label: 'Local Transport', icon: Zap, color: 'bg-pink-100 text-pink-700' },
] as const;

const TIER_TITLES = {
  budget: 'Budget Plan Summary',
  comfort: 'Comfort Plan Summary',
  luxury: 'Luxury Plan Summary',
};

export function CostBreakdown({ cost, days, tier }: CostBreakdownProps) {
  return (
    <section className="w-full border-t border-slate-200 bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">{TIER_TITLES[tier]}</h2>
          <p className="mt-1 text-slate-600">{days}-day {tier} trip</p>
        </div>

        <Card className="mb-8 border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl">
          <CardContent className="p-8">
            <p className="text-sm text-blue-100">Total group cost</p>
            <p className="mt-1 text-5xl font-bold tracking-tight">${cost.totalCost.toLocaleString()}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-blue-500/40 pt-6">
              <div>
                <p className="text-xs text-blue-100">Per person</p>
                <p className="text-2xl font-bold">${cost.perPersonCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100">Per day</p>
                <p className="text-2xl font-bold">${Math.round(cost.perPersonCost / days).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-3">
          {costItems.map(({ key, label, icon: Icon, color }) => {
            const amount = cost[key];
            const percentage = cost.totalCost > 0 ? Math.round((amount / cost.totalCost) * 100) : 0;
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">{percentage}% of total</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-900">${amount.toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">Excludes international flights from your home city</p>
      </div>
    </section>
  );
}
