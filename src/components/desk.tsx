"use client";

import { useEffect, useRef, useState } from "react";
import { PERSONALITY_QUESTIONS } from "@/lib/brief";
import {
  personalityLine,
  recommendFromPersonality,
  type Personality,
  type PlacePick,
} from "@/lib/personality-places";
import { Check, ChevronLeft } from "lucide-react";

const QUESTION_STEPS = ["pace", "company", "comfort", "plan"] as const;
const STEPS = ["cover", ...QUESTION_STEPS] as const;

type QuestionStep = (typeof QUESTION_STEPS)[number];
type StepId = (typeof STEPS)[number];
type Phase = "flow" | "results";

type Answers = {
  pace: Personality["pace"] | null;
  company: Personality["company"] | null;
  comfort: Personality["comfort"] | null;
  plan: Personality["plan"] | null;
};

const INITIAL_ANSWERS: Answers = {
  pace: null,
  company: null,
  comfort: null,
  plan: null,
};

type Choice = {
  id: string;
  label: string;
  hint: string;
  selected: boolean;
  next: Answers;
};

function isQuestion(step: StepId): step is QuestionStep {
  return (QUESTION_STEPS as readonly string[]).includes(step);
}

function progressFor(step: StepId, phase: Phase): number {
  if (phase === "results") return 1;
  if (step === "cover") return 0;
  const index = QUESTION_STEPS.indexOf(step as QuestionStep);
  return (index + 1) / QUESTION_STEPS.length;
}

function ready(step: StepId, answers: Answers): boolean {
  if (isQuestion(step)) return answers[step] !== null;
  return true;
}

function letter(index: number): string {
  return String.fromCharCode(65 + index);
}

function asPersonality(answers: Answers): Personality | null {
  if (!answers.pace || !answers.company || !answers.comfort || !answers.plan) return null;
  return {
    pace: answers.pace,
    company: answers.company,
    comfort: answers.comfort,
    plan: answers.plan,
  };
}

export function Desk() {
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [step, setStep] = useState<StepId>("cover");
  const [phase, setPhase] = useState<Phase>("flow");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const scrollerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number | null>(null);
  const stepRef = useRef(step);
  const answersRef = useRef(answers);
  const phaseRef = useRef(phase);

  function cancelAdvance() {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  function finish(from: StepId) {
    const index = STEPS.indexOf(from);
    if (index >= STEPS.length - 1) {
      if (!asPersonality(answersRef.current)) return;
      setDirection("forward");
      setPhase("results");
      return;
    }
    setDirection("forward");
    setStep(STEPS[index + 1]);
  }

  function scheduleAdvance(from: StepId) {
    cancelAdvance();
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      if (stepRef.current !== from) return;
      finish(from);
    }, 240);
  }

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step, phase]);

  useEffect(() => {
    return () => {
      cancelAdvance();
    };
  }, []);

  function choicesFor(current: Answers, currentStep: StepId): Choice[] | null {
    if (!isQuestion(currentStep)) return null;
    const question = PERSONALITY_QUESTIONS.find((item) => item.id === currentStep);
    if (!question) return null;
    return question.options.map((option) => ({
      id: option.id,
      label: option.label,
      hint: option.hint,
      selected: current[currentStep] === option.id,
      next: { ...current, [currentStep]: option.id },
    }));
  }

  function choose(next: Answers) {
    const from = stepRef.current;
    setAnswers(next);
    answersRef.current = next;
    scheduleAdvance(from);
  }

  function goForward() {
    cancelAdvance();
    if (phaseRef.current !== "flow") return;
    const currentStep = stepRef.current;
    if (!ready(currentStep, answersRef.current)) return;
    finish(currentStep);
  }

  function goBack() {
    cancelAdvance();
    if (phaseRef.current === "results") {
      setPhase("flow");
      setDirection("back");
      setStep("plan");
      return;
    }
    const index = STEPS.indexOf(stepRef.current);
    if (index <= 0) return;
    setDirection("back");
    setStep(STEPS[index - 1]);
  }

  function startAgain() {
    cancelAdvance();
    setAnswers(INITIAL_ANSWERS);
    setPhase("flow");
    setDirection("back");
    setStep("cover");
  }

  useEffect(() => {
    stepRef.current = step;
    answersRef.current = answers;
    phaseRef.current = phase;
  }, [step, answers, phase]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Enter") {
        const target = event.target as HTMLElement | null;
        if (target?.closest("a, button, input, textarea")) return;
        event.preventDefault();
        if (phase === "results") return;
        goForward();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        goBack();
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (phase !== "flow") return;
      const alpha = event.key.toLowerCase();
      if (alpha.length !== 1 || alpha < "a" || alpha > "z") return;
      const options = choicesFor(answers, step);
      const choice = options?.[alpha.charCodeAt(0) - 97];
      if (!choice) return;
      choose(choice.next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const personality = asPersonality(answers);
  const picks = phase === "results" && personality ? recommendFromPersonality(personality) : null;
  const choices = phase === "flow" ? choicesFor(answers, step) : null;
  const showProgress = !(phase === "flow" && step === "cover");
  const progress = progressFor(step, phase);
  const questionIndex = phase === "flow" && isQuestion(step) ? QUESTION_STEPS.indexOf(step) + 1 : null;
  const canGoBack = phase === "results" || step !== "cover";
  const prompt = screenPrompt(step, phase);
  const support = screenSupport(step, phase, personality);
  const continueLabel = phase === "results" ? "Start again" : step === "cover" ? "Start" : "Continue";
  const footerDisabled = phase === "flow" && step !== "cover" && !ready(step, answers);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="z-10 shrink-0 px-4 pt-[max(0.7rem,env(safe-area-inset-top))] sm:pt-12">
        <div className="grid grid-cols-[5.2rem_minmax(0,1fr)_5.2rem] items-center">
          {canGoBack ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-primary active:opacity-60"
            >
              <ChevronLeft className="size-5" aria-hidden />
              Back
            </button>
          ) : (
            <span />
          )}
          <p className="truncate text-center text-[13px] font-semibold tracking-[0.08em] text-foreground/80">
            {phase === "results" ? "Shortlist" : "Halcyon"}
          </p>
          <p className="justify-self-end text-[13px] font-medium text-muted-foreground tabular-nums">
            {questionIndex ? `${questionIndex} / 4` : ""}
          </p>
        </div>
        <div
          className={`mt-3 h-1 overflow-hidden rounded-full bg-black/10 ${showProgress ? "" : "invisible"}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Questions answered"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
        <div
          key={`${phase}-${step}`}
          className={`px-5 py-6 ${phase === "flow" ? "flex min-h-full flex-col justify-center" : ""} ${
            direction === "back" ? "step-back" : "step-forward"
          }`}
        >
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-[2rem] leading-[1.12] font-medium tracking-tight text-balance text-[oklch(0.2_0.02_55)] outline-none"
          >
            {prompt}
          </h1>
          {support ? (
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{support}</p>
          ) : null}

          {phase === "flow" && step === "cover" ? <CoverNotes /> : null}

          {choices ? (
            <div className="mt-7 flex flex-col gap-2.5" role="radiogroup" aria-label={prompt}>
              {choices.map((choice, index) => (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={choice.selected}
                  onClick={() => choose(choice.next)}
                  className={`flex w-full items-center gap-3 rounded-[1.15rem] px-3.5 py-3.5 text-left transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.985] ${
                    choice.selected
                      ? "bg-primary text-primary-foreground shadow-[0_10px_28px_oklch(0.38_0.055_175_/_0.28)]"
                      : "bg-white text-foreground shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-[0.55rem] text-[12px] font-semibold ${
                      choice.selected ? "bg-white/18" : "bg-foreground/[0.06] text-foreground/70"
                    }`}
                  >
                    {letter(index)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] leading-tight font-medium">{choice.label}</span>
                    <span
                      className={`mt-0.5 block text-[13px] leading-snug ${
                        choice.selected ? "text-primary-foreground/75" : "text-muted-foreground"
                      }`}
                    >
                      {choice.hint}
                    </span>
                  </span>
                  {choice.selected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                </button>
              ))}
            </div>
          ) : null}

          {picks ? <Shortlist picks={picks} /> : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-black/5 bg-white/75 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <button
          type="button"
          disabled={footerDisabled}
          onClick={() => {
            if (phase === "results") {
              startAgain();
              return;
            }
            goForward();
          }}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-[16px] font-semibold text-primary-foreground shadow-[0_8px_20px_oklch(0.38_0.055_175_/_0.25)] transition-transform active:scale-[0.99] disabled:opacity-40"
        >
          {continueLabel}
        </button>
        {phase === "flow" ? (
          <p className="mt-2 hidden text-center text-[11px] tracking-wide text-muted-foreground sm:block">
            {choices ? "A to choose  ·  Enter to continue" : "Enter to continue"}
          </p>
        ) : (
          <p className="mt-2 hidden text-center text-[11px] tracking-wide text-muted-foreground sm:block">
            Back changes the last answer
          </p>
        )}
      </div>
    </div>
  );
}

function screenPrompt(step: StepId, phase: Phase): string {
  if (phase === "results") return "Your shortlist.";
  if (step === "cover") return "Where should you go?";
  const question = PERSONALITY_QUESTIONS.find((item) => item.id === step);
  return question?.prompt ?? "";
}

function screenSupport(step: StepId, phase: Phase, personality: Personality | null): string | null {
  if (phase === "results" && personality) {
    return `${personalityLine(personality)} These three places follow only those answers.`;
  }
  if (step === "cover") {
    return "Four questions about how you like a holiday. Then three places, and a reason for each.";
  }
  if (isQuestion(step)) return "This answer is part of what chooses the shortlist.";
  return null;
}

function CoverNotes() {
  const notes = [
    ["01", "One question on screen"],
    ["02", "The shortlist follows only your answers"],
    ["03", "A place, and why it fits"],
  ];
  return (
    <ul className="mt-8 overflow-hidden rounded-[1.15rem] bg-white shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]">
      {notes.map(([index, line], noteIndex) => (
        <li
          key={index}
          className={`flex items-center gap-3 px-4 py-3.5 ${noteIndex < notes.length - 1 ? "border-b border-foreground/8" : ""}`}
        >
          <span className="w-7 font-heading text-[15px] text-primary">{index}</span>
          <span className="text-[15px]">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Shortlist({ picks }: { picks: PlacePick[] }) {
  return (
    <ol className="mt-6 flex flex-col gap-3">
      {picks.map((pick, index) => (
        <li
          key={pick.place}
          className="rounded-[1.15rem] bg-white px-4 py-4 shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]"
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-1 font-heading text-[1.7rem] leading-tight font-medium tracking-tight text-[oklch(0.2_0.02_55)]">
            {pick.place}
          </h2>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">Why this place</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/80">{pick.why}</p>
        </li>
      ))}
    </ol>
  );
}
