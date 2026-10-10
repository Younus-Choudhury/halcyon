import { gbp } from "@/lib/brief";
import type { FoundHoliday } from "@/lib/rank";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <article className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-sm text-mark">{String(rank).padStart(2, "0")}</p>
          <h3 className="font-heading mt-1 text-3xl tracking-tight">{result.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{result.host}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-heading text-3xl tracking-tight">{gbp(result.pricePerPerson)}</p>
          <p className="text-sm text-muted-foreground">a person</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={result.fit === "clean" ? "default" : "outline"}>
          {result.fit === "clean"
            ? "Fits this brief"
            : result.fit === "over"
              ? "Over your budget"
              : result.fit === "wrong-month"
                ? "Different month"
                : result.fit === "elsewhere"
                  ? "Not from London"
                  : "No date on this fare"}
        </Badge>
        <Badge variant="secondary">
          {result.priceSource === "listing" ? "Read on the listing" : "Price in the search result"}
        </Badge>
      </div>

      {result.why ? (
        <div className="mt-4">
          <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Why this place
          </h4>
          <p className="mt-2 text-sm leading-relaxed">{result.why}</p>
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed">{result.fitNote}</p>

      <Separator className="my-5" />

      <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            What the search said
          </h4>
          <p className="mt-2 text-sm leading-relaxed">{result.snippet}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.priceSentence}</p>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            For your party
          </h4>
          <p className="font-heading mt-2 text-2xl">{gbp(result.partyTotal)}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.partyNote}</p>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Source</h4>
        <p className="mt-2 text-sm leading-relaxed">
          <a
            href={result.url}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline decoration-primary/30 underline-offset-4"
          >
            {result.host}
          </a>
          <span className="text-muted-foreground"> · searched {searchedAt}</span>
        </p>
        <p className="mt-1 break-all text-sm leading-relaxed">
          <a href={result.url} target="_blank" rel="noreferrer" className="text-primary">
            {result.url}
          </a>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {result.priceSource === "listing"
            ? "The price was read on that page just now."
            : "The price is the one printed in the search result for that page. Open it before you book."}
        </p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Prompt: {result.searchQuery}
      </p>
    </article>
  );
}
