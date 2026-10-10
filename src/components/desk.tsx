"use client";

import { useState } from "react";
import { BriefForm } from "@/components/brief-form";
import { HolidayCard } from "@/components/holiday-card";
import { searchQueries, type Brief } from "@/lib/brief";
import type { Shortlist } from "@/lib/rank";

const INITIAL_BRIEF: Brief = {
  year: 2027,
  month: 2,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 800,
  style: "winter-sun",
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

  const queries = searchQueries(brief);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-6">
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
      <section id="shortlist" className="min-w-0 scroll-mt-6">
        {pending ? (
          <div className="rounded-2xl bg-card px-6 py-16 ring-1 ring-foreground/10">
            <p className="font-heading text-3xl tracking-tight">Searching for current prices.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Three new searches are running for this brief. Earlier fares are not reused.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {queries.map((query) => (
                <li key={query}>{query}</li>
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
