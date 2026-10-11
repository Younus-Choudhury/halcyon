"use client";

import { useEffect, useRef, useState } from "react";
import {
  FLOW,
  personalityLine,
  recommendFromPersonality,
  type FlowQuestion,
  type HolidayAnswers,
  type PlacePick,
} from "@/lib/personality-places";

const STEPS = ["cover", ...FLOW.map((question) => question.id)] as const;

type StepId = (typeof STEPS)[number];
type Phase = "flow" | "results";
type Answers = {
  [Key in keyof HolidayAnswers]: HolidayAnswers[Key] | null;
};

const INITIAL_ANSWERS: Answers = {
  pace: null,
  company: null,
  comfort: null,
  plan: null,
  setting: null,
  distance: null,
  food: null,
  morning: null,
  travellingFor: "",
  remember: "",
  avoid: "",
  loved: "",
};

type Choice = {
  id: string;
  label: string;
  hint: string;
  selected: boolean;
  next: Answers;
};

function questionAt(step: StepId): FlowQuestion | null {
  return FLOW.find((item) => item.id === step) ?? null;
}

function isChoice(step: StepId): boolean {
  return questionAt(step)?.kind === "choice";
}

function isOpen(step: StepId): boolean {
  return questionAt(step)?.kind === "open";
}

function progressFor(step: StepId, phase: Phase): number {
  if (phase === "results") return 1;
  if (step === "cover") return 0;
  const index = FLOW.findIndex((item) => item.id === step);
  return (index + 1) / FLOW.length;
}

function openEnough(value: string | null): boolean {
  return (value ?? "").trim().length >= 8;
}

function ready(step: StepId, answers: Answers): boolean {
  const question = questionAt(step);
  if (!question) return true;
  if (question.kind === "open") return openEnough(answers[question.id]);
  return answers[question.id] !== null;
}

function letter(index: number): string {
  return String.fromCharCode(65 + index);
}

function asHoliday(answers: Answers): HolidayAnswers | null {
  if (
    !answers.pace ||
    !answers.company ||
    !answers.comfort ||
    !answers.plan ||
    !answers.setting ||
    !answers.distance ||
    !answers.food ||
    !answers.morning ||
    !openEnough(answers.travellingFor) ||
    !openEnough(answers.remember) ||
    !openEnough(answers.avoid) ||
    !openEnough(answers.loved)
  ) {
    return null;
  }
  return {
    pace: answers.pace,
    company: answers.company,
    comfort: answers.comfort,
    plan: answers.plan,
    setting: answers.setting,
    distance: answers.distance,
    food: answers.food,
    morning: answers.morning,
    travellingFor: (answers.travellingFor ?? "").trim(),
    remember: (answers.remember ?? "").trim(),
    avoid: (answers.avoid ?? "").trim(),
    loved: (answers.loved ?? "").trim(),
  };
}

export function Desk() {
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [step, setStep] = useState<StepId>("cover");
  const [phase, setPhase] = useState<Phase>("flow");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const scrollerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
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
      if (!asHoliday(answersRef.current)) return;
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
    if (isOpen(step)) fieldRef.current?.focus({ preventScroll: true });
    else headingRef.current?.focus({ preventScroll: true });
  }, [step, phase]);

  useEffect(() => {
    return () => {
      cancelAdvance();
    };
  }, []);

  function choicesFor(current: Answers, currentStep: StepId): Choice[] | null {
    const question = questionAt(currentStep);
    if (!question || question.kind !== "choice") return null;
    return question.options.map((option) => ({
      id: option.id,
      label: option.label,
      hint: option.hint,
      selected: current[question.id] === option.id,
      next: { ...current, [question.id]: option.id },
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
      setStep("loved");
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

  const holiday = asHoliday(answers);
  const picks = phase === "results" && holiday ? recommendFromPersonality(holiday) : null;
  const choices = phase === "flow" ? choicesFor(answers, step) : null;
  const openQuestion = phase === "flow" && isOpen(step) ? questionAt(step) : null;
  const showProgress = !(phase === "flow" && step === "cover");
  const progress = progressFor(step, phase);
  const questionIndex = phase === "flow" && step !== "cover" ? FLOW.findIndex((item) => item.id === step) + 1 : null;
  const canGoBack = phase === "results" || step !== "cover";
  const prompt = screenPrompt(step, phase);
  const support = screenSupport(step, phase, holiday);
  const continueLabel = phase === "results" ? "Start again" : step === "cover" ? "Start" : "Continue";
  const footerDisabled = phase === "flow" && step !== "cover" && !ready(step, answers);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white text-[#111]">
      <header className="z-10 shrink-0 px-5 pt-[max(1.1rem,env(safe-area-inset-top))]">
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-end">
          {canGoBack ? (
            <button
              type="button"
              onClick={goBack}
              className="justify-self-start pb-1 text-[11px] tracking-[0.22em] uppercase active:opacity-50"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-col items-center">
            <p className="text-[12px] tracking-[0.42em] uppercase">Halcyon</p>
            <span className="mt-2 h-px w-7 bg-[#e10600]" aria-hidden />
          </div>
          <p className="justify-self-end pb-1 text-[11px] tracking-[0.18em] tabular-nums">
            {questionIndex ? `${String(questionIndex).padStart(2, "0")} / 12` : phase === "results" ? "12 / 12" : ""}
          </p>
        </div>
        <div
          className={`mt-4 h-px bg-black/15 ${showProgress ? "" : "invisible"}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Questions answered"
        >
          <div
            className="h-px bg-[#111] transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
        <div
          key={`${phase}-${step}`}
          className={`px-5 pt-10 pb-8 ${phase === "flow" ? "flex min-h-full flex-col justify-center" : ""} ${
            direction === "back" ? "step-back" : "step-forward"
          }`}
        >
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-[2.7rem] leading-[0.92] font-normal tracking-[-0.03em] text-balance text-[#111] italic outline-none"
          >
            {prompt}
          </h1>
          {support ? <p className="mt-5 max-w-[36ch] text-[13px] leading-relaxed text-[#111]/60">{support}</p> : null}

          {phase === "flow" && step === "cover" ? <CoverNotes /> : null}

          {choices ? (
            <div className="mt-10 border-t border-[#111]" role="radiogroup" aria-label={prompt}>
              {choices.map((choice, index) => (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={choice.selected}
                  onClick={() => choose(choice.next)}
                  className={`flex w-full items-baseline gap-4 border-b border-[#111] px-1 py-4 text-left ${
                    choice.selected ? "bg-[#111] text-white" : "bg-white text-[#111]"
                  }`}
                >
                  <span className="w-6 shrink-0 text-[11px] tracking-[0.18em]">{letter(index)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] tracking-[0.16em] uppercase">{choice.label}</span>
                    <span className={`mt-1 block text-[12px] leading-snug ${choice.selected ? "text-white/65" : "text-[#111]/55"}`}>
                      {choice.hint}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {openQuestion && openQuestion.kind === "open" ? (
            <label className="mt-10 block">
              <span className="text-[10px] tracking-[0.28em] text-[#e10600] uppercase">In your words</span>
              <textarea
                ref={fieldRef}
                rows={4}
                value={answers[openQuestion.id] ?? ""}
                placeholder={openQuestion.placeholder}
                onChange={(event) => {
                  const next = { ...answers, [openQuestion.id]: event.target.value };
                  answersRef.current = next;
                  setAnswers(next);
                }}
                className="mt-4 w-full resize-none border-b border-[#111] bg-transparent pb-3 font-heading text-[1.55rem] leading-snug font-normal text-[#111] italic outline-none placeholder:text-[#111]/25"
              />
            </label>
          ) : null}

          {picks ? <Shortlist picks={picks} /> : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#111] bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
          className="flex h-12 w-full items-center justify-center bg-[#111] text-[11px] tracking-[0.28em] text-white uppercase disabled:opacity-30"
        >
          {continueLabel}
        </button>
        <p className={`mt-3 text-center text-[10px] tracking-[0.18em] text-[#111]/45 uppercase ${phase === "results" || isOpen(step) ? "" : "hidden sm:block"}`}>
          {phase === "results"
            ? "Back changes the last answer"
            : isOpen(step)
              ? "A sentence, then continue"
              : isChoice(step)
                ? "A to choose  ·  Enter to continue"
                : "Enter to continue"}
        </p>
      </div>
    </div>
  );
}

function screenPrompt(step: StepId, phase: Phase): string {
  if (phase === "results") return "Your shortlist.";
  if (step === "cover") return "Where should you go?";
  return questionAt(step)?.prompt ?? "";
}

function screenSupport(step: StepId, phase: Phase, holiday: HolidayAnswers | null): string | null {
  if (phase === "results" && holiday) {
    return `${personalityLine(holiday)} These three British Airways Holidays places follow your twelve answers.`;
  }
  if (step === "cover") {
    return "Eight choices, then four things you write. Three British Airways Holidays places, and a reason that uses your words.";
  }
  const question = questionAt(step);
  if (question?.kind === "open") return question.support;
  if (question?.kind === "choice") return "This answer is part of what chooses the shortlist.";
  return null;
}

function CoverNotes() {
  const notes = [
    ["01", "Eight choices"],
    ["02", "Four answers in your words"],
    ["03", "A place, and why it fits"],
  ];
  return (
    <ul className="mt-12 border-t border-[#111]">
      {notes.map(([index, line]) => (
        <li key={index} className="flex items-baseline gap-6 border-b border-[#111] py-3.5">
          <span className="w-7 text-[11px] tracking-[0.18em]">{index}</span>
          <span className="text-[12px] tracking-[0.14em] uppercase">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Shortlist({ picks }: { picks: PlacePick[] }) {
  return (
    <ol className="mt-10 border-t border-[#111]">
      {picks.map((pick, index) => (
        <li key={pick.place} className="border-b border-[#111] py-8">
          <p className="text-[10px] tracking-[0.28em] uppercase">
            {String(index + 1).padStart(2, "0")}
            <span className="text-[#e10600]"> / </span>
            British Airways Holidays
          </p>
          <h2 className="mt-3 font-heading text-[3rem] leading-[0.9] font-normal tracking-[-0.03em] text-[#111] italic">
            {pick.place}
          </h2>
          <p className="mt-6 text-[10px] tracking-[0.28em] text-[#e10600] uppercase">Why this place</p>
          <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-[#111]/75">{pick.why}</p>
        </li>
      ))}
    </ol>
  );
}
