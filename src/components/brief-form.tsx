"use client";

import { monthOptions, STYLE_OPTIONS, type Brief, type TripStyle } from "@/lib/brief";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = monthOptions();
const NIGHTS = [2, 3, 4, 5, 7, 10, 14];

export function BriefForm({
  brief,
  error,
  pending,
  onChange,
  onSubmit,
}: {
  brief: Brief;
  error: string | null;
  pending: boolean;
  onChange: (brief: Brief) => void;
  onSubmit: () => void;
}) {
  const monthValue = `${brief.year}-${brief.month}`;

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h2 className="font-heading text-2xl tracking-tight">The brief</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          London departures. Answer the four questions beside this, then ask. Each shortlist searches again.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="when">When</Label>
        <Select
          value={monthValue}
          items={MONTHS}
          onValueChange={(value) => {
            if (!value) return;
            const [year, month] = value.split("-").map(Number);
            onChange({ ...brief, year, month });
          }}
        >
          <SelectTrigger id="when" className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nights">Nights</Label>
          <Select
            value={String(brief.nights)}
            items={NIGHTS.map((nights) => ({
              value: String(nights),
              label: `${nights} nights`,
            }))}
            onValueChange={(value) => {
              if (!value) return;
              onChange({ ...brief, nights: Number(value) });
            }}
          >
            <SelectTrigger id="nights" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NIGHTS.map((nights) => (
                <SelectItem key={nights} value={String(nights)}>
                  {nights} nights
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="budget">Budget a person</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              £
            </span>
            <Input
              id="budget"
              inputMode="numeric"
              className="h-10 pl-7"
              value={brief.budget ? String(brief.budget) : ""}
              onValueChange={(value) => {
                const next = value.replace(/[^\d]/g, "");
                onChange({ ...brief, budget: next ? Number(next) : 0 });
              }}
              aria-invalid={error?.toLowerCase().includes("budget") ? true : undefined}
              aria-describedby={error?.toLowerCase().includes("budget") ? "budget-error" : undefined}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="adults">Adults</Label>
          <Select
            value={String(brief.adults)}
            items={[1, 2, 3, 4, 5, 6].map((count) => ({
              value: String(count),
              label: String(count),
            }))}
            onValueChange={(value) => {
              if (!value) return;
              onChange({ ...brief, adults: Number(value) });
            }}
          >
            <SelectTrigger id="adults" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="children">Children</Label>
          <Select
            value={String(brief.children)}
            items={[0, 1, 2, 3, 4].map((count) => ({
              value: String(count),
              label: String(count),
            }))}
            onValueChange={(value) => {
              if (!value) return;
              onChange({ ...brief, children: Number(value) });
            }}
          >
            <SelectTrigger id="children" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">What you want</legend>
        <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Trip style">
          {STYLE_OPTIONS.map((option) => {
            const selected = brief.style === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...brief, style: option.id as TripStyle })}
                className={`rounded-xl px-3 py-2 text-left ring-1 transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-background ring-foreground/10 hover:bg-muted"
                }`}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                <span
                  className={`block text-xs ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {error ? (
        <p id="budget-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Searching current prices" : "Shortlist three holidays"}
      </Button>
    </form>
  );
}
