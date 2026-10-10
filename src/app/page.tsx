import { Desk } from "@/components/desk";
import { PRICE_CHECKED_ON } from "@/data/holidays";

export default function Home() {
  return (
    <>
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:py-8">
          <div>
            <p className="text-xs tracking-[0.22em] text-primary uppercase">Holiday desk</p>
            <h1 className="font-heading text-5xl tracking-tight sm:text-6xl">Halcyon</h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Three holidays from London, chosen from prices I looked up on {PRICE_CHECKED_ON}.
            Each card links to the listing. Fares move, and I have not invented the ones that were missing.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Desk />
      </main>
    </>
  );
}
