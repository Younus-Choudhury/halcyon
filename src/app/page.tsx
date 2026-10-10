import { Desk } from "@/components/desk";

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
            Tell the desk how you like to travel, then it searches for three holidays from London
            and reads a per-person fare from what comes back.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Desk />
      </main>
    </>
  );
}
