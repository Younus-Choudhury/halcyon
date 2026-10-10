import { PRICE_CHECKED_ON } from "@/data/holidays";
import { gbp, type Recommendation } from "@/lib/recommend";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function HolidayCard({
  result,
  rank,
}: {
  result: Recommendation;
  rank: number;
}) {
  const { holiday, quote, fit, fitNote } = result;
  const rankLabel = String(rank).padStart(2, "0");

  return (
    <article className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-sm text-mark">{rankLabel}</p>
          <h3 className="font-heading mt-1 text-3xl tracking-tight">
            {holiday.destination}
          </h3>
          <p className="text-sm text-muted-foreground">
            {holiday.country} · {holiday.departFrom}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-heading text-3xl tracking-tight">
            {gbp(quote.perAdult)}
          </p>
          <p className="text-sm text-muted-foreground">
            {quote.perChild
              ? `an adult · ${gbp(quote.perChild)} a child`
              : "a person"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={fit === "clean" ? "default" : "outline"}>
          {fit === "clean" ? "Fits this brief" : "Closest"}
        </Badge>
        <Badge variant="secondary">{holiday.nights} nights</Badge>
        <Badge variant="secondary">{holiday.board}</Badge>
      </div>

      <p className="font-heading mt-4 text-xl leading-snug">{holiday.title}</p>
      <p className="mt-3 text-sm leading-relaxed">{fitNote}</p>

      <Separator className="my-5" />

      <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Why this one
          </h4>
          <p className="mt-2 text-sm leading-relaxed">{holiday.why}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {holiday.suits}
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            For your party
          </h4>
          <p className="mt-2 font-heading text-2xl">
            {quote.partyTotal === null ? "Ask them to reprice" : gbp(quote.partyTotal)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {quote.partyNote}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
          How the days go
        </h4>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {holiday.days.map((day) => (
            <li key={day.title} className="rounded-xl bg-muted/70 p-3">
              <p className="text-sm font-medium">{day.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {day.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            In the price
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            {holiday.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Not included
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {holiday.excludes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
          Where the price came from
        </h4>
        <ul className="mt-2 space-y-2">
          {holiday.lines.map((line) => (
            <li key={line.label} className="text-sm leading-relaxed">
              <span className="font-medium">{line.label}. </span>
              {line.detail}
            </li>
          ))}
        </ul>
      </div>

      {holiday.caveat ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {holiday.caveat}
        </p>
      ) : null}

      <p className="mt-4 text-sm">
        <a
          href={holiday.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline decoration-primary/30 underline-offset-4"
        >
          {holiday.sourceName}
        </a>
        <span className="text-muted-foreground">
          {" "}
          · checked {PRICE_CHECKED_ON}
        </span>
      </p>
    </article>
  );
}
