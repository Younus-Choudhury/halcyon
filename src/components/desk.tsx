"use client";

import { useState } from "react";
import { BriefForm } from "@/components/brief-form";
import { HolidayCard } from "@/components/holiday-card";
import { recommend, type Brief, type Shortlist } from "@/lib/recommend";

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
  const [shortlist, setShortlist] = useState<Shortlist | null>(null);

  function submit() {
    if (!brief.budget || brief.budget < 50) {
      setError("Enter a budget of at least £50 a person so I can see what fits inside it.");
      return;
    }
    if (brief.adults < 1) {
      setError("Add at least one adult.");
      return;
    }
    setError(null);
    setShortlist(recommend(brief));
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        document.getElementById("shortlist")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-6">
        <BriefForm brief={brief} error={error} onChange={setBrief} onSubmit={submit} />
      </div>
      <section id="shortlist" className="min-w-0 scroll-mt-6">
        {shortlist === null ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 bg-card/60 px-6 py-16">
            <p className="font-heading text-3xl tracking-tight">The shortlist is empty.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Tell the desk when you want to go, who is coming, and what kind of holiday
              you are after. I will pick three trips from the ones I priced on the web,
              and say plainly when the date, the budget or the party does not fit.
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
            </div>
            {shortlist.results.map((result, index) => (
              <HolidayCard key={result.holiday.id} result={result} rank={index + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
