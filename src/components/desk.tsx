"use client";

import { useState } from "react";
import { BriefForm } from "@/components/brief-form";
import { HolidayCard } from "@/components/holiday-card";
import { PersonalityQuestionnaire } from "@/components/personality";
import { PERSONALITY_QUESTIONS, plannedSearches, type Brief } from "@/lib/brief";
import type { Shortlist } from "@/lib/rank";

const INITIAL_BRIEF: Brief = {
  year: 2027,
  month: 2,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 800,
  style: "winter-sun",
  pace: null,
  company: null,
  comfort: null,
  plan: null,
};

export function Desk() {
  const [brief, setBrief] = useState<Brief>(INITIAL_BRIEF);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [shortlist, setShortlist] = useState<Shortlist | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function submit() {
    if (!brief.budget || brief.budget < 50) {
      setError("Enter a budget of at least £50 a person so I can see what fits inside it.");
      return;
    }
    if (brief.adults < 1) {
      setError("Add at least one adult.");
      return;
    }
    if (PERSONALITY_QUESTIONS.some((question) => !brief[question.id])) {
      setError("Answer the four questions about how you like a holiday.");
      document.getElementById("personality")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setError(null);
    setSearchError(null);
    setPending(true);
    setShortlist(null);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        document.getElementById("shortlist")?.scrollIntoView({ behavior: "smooth" });
      }
    });

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
        cache: "no-store",
      });
      const payload = (await response.json()) as Shortlist & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "The search failed.");
      }
      setShortlist(payload);
    } catch (caught) {
      setSearchError(caught instanceof Error ? caught.message : "The search failed.");
    } finally {
      setPending(false);
    }
  }

  const plans = plannedSearches(brief);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[26rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <PersonalityQuestionnaire brief={brief} onChange={setBrief} />
        <BriefForm
          brief={brief}
          error={error}
          pending={pending}
          onChange={setBrief}
          onSubmit={() => {
            void submit();
          }}
        />
      </div>
      <section id="shortlist" className="flex min-w-0 scroll-mt-6 flex-col gap-4">
        {pending ? (
          <div className="rounded-2xl bg-card px-6 py-16 ring-1 ring-foreground/10">
            <p className="font-heading text-3xl tracking-tight">Searching for current prices.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Each place was chosen from your answers. A fresh search is running for a package price, and earlier fares are not reused.
            </p>
            <ul className="mt-5 space-y-4">
              {plans.map((plan) => (
                <li key={plan.query}>
                  <p className="text-sm font-medium">{plan.place}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{plan.why}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Prompt: {plan.query}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : searchError ? (
          <div className="rounded-2xl bg-mark/10 px-6 py-16 ring-1 ring-mark/30">
            <p className="font-heading text-3xl tracking-tight">The search did not finish.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed">{searchError}</p>
          </div>
        ) : shortlist === null ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 bg-card/60 px-6 py-16">
            <p className="font-heading text-3xl tracking-tight">The shortlist is empty.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Tell the desk when you want to go, who is coming, and what kind of holiday you
              are after. Each shortlist searches the web at that moment, because prices change.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div
              className={`rounded-2xl px-5 py-4 ${
                shortlist.cleanCount === 0
                  ? "bg-mark/10 ring-1 ring-mark/30"
                  : "bg-primary/10 ring-1 ring-primary/20"
              }`}
            >
              <p className="text-sm leading-relaxed">{shortlist.intro}</p>
              <p className="mt-2 text-xs tracking-wide text-muted-foreground uppercase">
                Searched {shortlist.searchedAt}
              </p>
            </div>
            {shortlist.results.map((result, index) => (
              <HolidayCard
                key={result.id}
                result={result}
                rank={index + 1}
                searchedAt={shortlist.searchedAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
