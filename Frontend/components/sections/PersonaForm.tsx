'use client';

import { Dispatch, SetStateAction } from 'react';
import { personaOptions, type TravelStyle, type GroupType, type TravelPace } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';

interface PersonaFormProps {
  selectedStyle: TravelStyle | null;
  setSelectedStyle: Dispatch<SetStateAction<TravelStyle | null>>;
  selectedGroup: GroupType | null;
  setSelectedGroup: Dispatch<SetStateAction<GroupType | null>>;
  selectedPace: TravelPace | null;
  setSelectedPace: Dispatch<SetStateAction<TravelPace | null>>;
  selectedDays: number;
  setSelectedDays: Dispatch<SetStateAction<number>>;
  onGenerate: () => void;
  isLoading?: boolean;
  error?: string | null;
}


const selectedChoiceClass =
  'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20';
const unselectedChoiceClass =
  'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';

interface ChoiceGroupProps<T extends string> {
  label: string;
  hint?: string;
  value: T | null;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

function ChoiceGroup<T extends string>({ label, hint, value, onChange, options }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="space-y-3">
      <div>
        <legend className="text-sm font-medium text-slate-900">{label}</legend>
        {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                selected ? selectedChoiceClass : unselectedChoiceClass
              )}
            >
              <Icon className={cn('h-4 w-4', selected ? 'text-white' : 'text-slate-500')} />
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PersonaForm({
  selectedStyle,
  setSelectedStyle,
  selectedGroup,
  setSelectedGroup,
  selectedPace,
  setSelectedPace,
  selectedDays,
  setSelectedDays,
  onGenerate,
  isLoading,
  error,
}: PersonaFormProps) {
  const isComplete = selectedStyle && selectedGroup && selectedPace;

  return (
    <section className="w-full border-t border-slate-200 bg-white px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium text-blue-600">Step 2 of 2</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Customize your trip
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Choose your preferences and we&apos;ll generate Budget, Comfort, and Luxury itineraries.
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border border-slate-200 p-6 sm:p-8">
          <ChoiceGroup
            label="Travel style"
            hint="What kind of experience are you looking for?"
            value={selectedStyle}
            onChange={setSelectedStyle}
            options={personaOptions.styles.map((o) => ({
              value: o.value as TravelStyle,
              label: o.label,
              icon: o.icon,
            }))}
          />

          <div className="h-px bg-slate-100" />

          <ChoiceGroup
            label="Group type"
            hint="Who is traveling with you?"
            value={selectedGroup}
            onChange={setSelectedGroup}
            options={personaOptions.groups.map((o) => ({
              value: o.value as GroupType,
              label: o.label,
              icon: o.icon,
            }))}
          />

          <div className="h-px bg-slate-100" />

          <ChoiceGroup
            label="Travel pace"
            hint="How packed should each day feel?"
            value={selectedPace}
            onChange={setSelectedPace}
            options={personaOptions.paces.map((o) => ({
              value: o.value as TravelPace,
              label: o.label,
              icon: o.icon,
            }))}
          />

          <div className="h-px bg-slate-100" />

          <fieldset className="space-y-3">
            <div>
              <legend className="text-sm font-medium text-slate-900">Trip length</legend>
              <p className="mt-0.5 text-sm text-slate-500">How many days is your trip?</p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={14}
                value={selectedDays}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isNaN(value)) {
                    setSelectedDays(Math.min(14, Math.max(1, value)));
                  }
                }}
                className="h-11 max-w-[120px] rounded-xl border-slate-200 px-4 text-base font-semibold text-slate-900 focus-visible:border-blue-600 focus-visible:ring-blue-600/20"
                aria-label="Number of trip days"
              />
              <span className="text-sm text-slate-600">
                {selectedDays === 1 ? 'day' : 'days'} (1–14)
              </span>
            </div>
          </fieldset>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={onGenerate}
            disabled={!isComplete || isLoading}
            size="lg"
            className="h-11 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building your plans...
              </>
            ) : (
              <>
                Generate itineraries
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {!isComplete && (
            <p className="text-center text-xs text-slate-500">
              Select travel style, group type, and pace to continue.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
