import { gbp } from "@/lib/brief";
import type { FoundHoliday } from "@/lib/rank";
import { ChevronRight } from "lucide-react";

function fitLabel(fit: FoundHoliday["fit"]): string {
  if (fit === "clean") return "Fits this brief";
  if (fit === "over") return "Over your budget";
  if (fit === "wrong-month") return "Different month";
  if (fit === "elsewhere") return "Not from London";
  return "No date on this fare";
}

function fitClass(fit: FoundHoliday["fit"]): string {
  if (fit === "clean") return "bg-primary/12 text-primary";
  if (fit === "over") return "bg-mark/12 text-mark";
  return "bg-foreground/[0.06] text-muted-foreground";
}

export function HolidayCard({
  result,
  rank,
  searchedAt,
}: {
  result: FoundHoliday;
  rank: number;
  searchedAt: string;
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_12px_32px_oklch(0.3_0.02_60_/_0.08)]">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {String(rank).padStart(2, "0")}
          </p>
          <div className="text-right">
            <p className="font-heading text-[1.7rem] leading-none font-medium tracking-tight text-[oklch(0.2_0.02_55)]">
              {gbp(result.pricePerPerson)}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">a person</p>
          </div>
        </div>
        <h3 className="font-heading mt-2 text-[1.65rem] leading-tight font-medium tracking-tight text-[oklch(0.2_0.02_55)]">
          {result.title}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{result.host}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${fitClass(result.fit)}`}>
            {fitLabel(result.fit)}
          </span>
          <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
            {result.priceSource === "listing" ? "Read on the listing" : "Price in the search result"}
          </span>
        </div>
      </div>

      <div className="space-y-3 border-t border-foreground/8 px-4 py-3.5">
        {result.why ? (
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Why this place
            </h4>
            <p className="mt-1.5 text-[14px] leading-relaxed">{result.why}</p>
          </div>
        ) : null}
        <div>
          <h4 className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            What the search said
          </h4>
          <p className="mt-1.5 text-[14px] leading-relaxed">{result.snippet}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{result.priceSentence}</p>
          <p className="mt-2 text-[14px] leading-relaxed">{result.fitNote}</p>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            For your party
          </h4>
          <p className="font-heading mt-1 text-[1.45rem] tracking-tight">{gbp(result.partyTotal)}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{result.partyNote}</p>
        </div>
      </div>

      <a
        href={result.url}
        target="_blank"
        rel="noreferrer"
        className="block border-t border-foreground/8 px-4 py-3.5 transition-colors active:bg-foreground/[0.03]"
      >
        <span className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Source
            </span>
            <span className="mt-1 block text-[15px] font-semibold text-primary">{result.host}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-primary/70" aria-hidden />
        </span>
        <span className="mt-1.5 block text-[13px] leading-relaxed break-all text-primary/80">{result.url}</span>
        <span className="mt-2 block text-[12px] leading-relaxed text-muted-foreground">
          {result.priceSource === "listing"
            ? `The price was read on that page. Searched ${searchedAt}.`
            : `The price is the one printed in the search result. Open it before you book. Searched ${searchedAt}.`}
        </span>
      </a>

      <p className="border-t border-foreground/8 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
        <span className="font-semibold tracking-[0.14em] uppercase">Prompt </span>
        {result.searchQuery}
      </p>
    </article>
  );
}
