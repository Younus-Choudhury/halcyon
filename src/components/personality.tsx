"use client";

import { PERSONALITY_QUESTIONS, type Brief } from "@/lib/brief";

export function PersonalityQuestionnaire({
  brief,
  onChange,
}: {
  brief: Brief;
  onChange: (brief: Brief) => void;
}) {
  const answered = PERSONALITY_QUESTIONS.filter((question) => brief[question.id]).length;

  return (
    <section id="personality" className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-primary uppercase">Personality</p>
          <h2 className="font-heading mt-1 text-3xl tracking-tight">How do you like a holiday?</h2>
        </div>
        <p className="text-sm text-muted-foreground">{answered} of 4 answered</p>
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        These four answers change the places I search. A quiet beach week is not the same search as a lively one.
      </p>
      <div className="mt-5 flex flex-col gap-5">
        {PERSONALITY_QUESTIONS.map((question, index) => (
          <fieldset key={question.id}>
            <legend className="text-sm font-medium">
              {index + 1}. {question.prompt}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={question.prompt}>
              {question.options.map((option) => {
                const selected = brief[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange({ ...brief, [question.id]: option.id })}
                    className={`rounded-xl px-3 py-3 text-left ring-1 transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-background ring-foreground/10 hover:bg-muted"
                    }`}
                  >
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span
                      className={`mt-0.5 block text-xs leading-relaxed ${
                        selected ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
