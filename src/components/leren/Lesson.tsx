"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Star, Volume2, X } from "lucide-react";
import { fullNl, type Theme, type Word } from "@/lib/leren/types";
import {
  buildSession,
  easierStep,
  shuffle,
  stepWord,
  type Step,
} from "@/lib/leren/session";
import {
  completeLesson,
  markSeen,
  recordAnswer,
  themeStars,
  type Progress,
} from "@/lib/leren/progress";
import { updateProgress, useHydrated, useProgress } from "@/lib/leren/store";
import { initSpeech, speak, stopSpeaking } from "@/lib/leren/speech";
import { SpeakButton } from "./SpeakButton";

type Phase = "intro" | "playing" | "done";

/** Temps d'affichage du bandeau vert avant de passer à la suite. */
const CORRECT_PAUSE_MS = 1100;

export function Lesson({ theme }: { theme: Theme }) {
  const hydrated = useHydrated();
  // La progression est enregistrée à chaque réponse : si l'enfant ferme
  // l'onglet au milieu d'une leçon, son travail n'est pas perdu.
  const progress = useProgress();

  const [phase, setPhase] = useState<Phase>("intro");
  const [queue, setQueue] = useState<Step[]>([]);
  const [cursor, setCursor] = useState(0);
  const [result, setResult] = useState<null | { correct: boolean; picked: string }>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [askedCount, setAskedCount] = useState(0);
  const [starsBefore, setStarsBefore] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initSpeech();
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      stopSpeaking();
    };
  }, []);

  const step: Step | undefined = queue[cursor];

  // On prononce le mot dès qu'un exercice d'écoute apparaît.
  useEffect(() => {
    if (phase !== "playing" || !step) return;
    if (step.kind === "discover" || step.kind === "pick-image") {
      speak(step.kind === "discover" ? fullNl(step.word) : step.word.nl);
    }
  }, [phase, step]);

  const start = useCallback(() => {
    // Le premier appui de l'enfant sert aussi à débloquer le son : les
    // navigateurs interdisent de parler avant une action de l'utilisateur.
    speak(theme.nl);
    // On note les étoiles d'avant la leçon pour pouvoir fêter celles gagnées.
    setStarsBefore(themeStars(progress, theme));
    setQueue(buildSession(theme, progress));
    setCursor(0);
    setCorrectCount(0);
    setAskedCount(0);
    setResult(null);
    setPhase("playing");
  }, [progress, theme]);

  const goNext = useCallback(() => {
    setResult(null);
    const next = cursor + 1;
    if (next >= queue.length) {
      updateProgress((p) => completeLesson(p, theme.id));
      setPhase("done");
    } else {
      setCursor(next);
    }
  }, [cursor, queue.length, theme.id]);

  const answer = useCallback(
    (correct: boolean, picked: string) => {
      if (result || !step) return;
      setResult({ correct, picked });
      setAskedCount((n) => n + 1);

      const word = stepWord(step);
      if (word) updateProgress((p) => recordAnswer(p, word.id, correct));

      if (correct) {
        setCorrectCount((n) => n + 1);
        timer.current = setTimeout(goNext, CORRECT_PAUSE_MS);
      } else {
        // Un mot raté revient plus tard dans la même leçon, sous une forme
        // plus facile. L'enfant ne quitte jamais la leçon sur un échec.
        setQueue((q) => [...q, easierStep(step, theme.words, progress.reader)]);
      }
    },
    [result, step, goNext, theme.words, progress.reader]
  );

  if (!hydrated) {
    return <div className="p-8 text-center text-lg">Un instant…</div>;
  }

  if (phase === "intro") {
    return <Intro theme={theme} onStart={start} />;
  }

  if (phase === "done") {
    return (
      <Done
        theme={theme}
        progress={progress}
        starsBefore={starsBefore}
        correct={correctCount}
        asked={askedCount}
        onAgain={start}
      />
    );
  }

  if (!step) return null;

  const percent = Math.round((cursor / Math.max(1, queue.length)) * 100);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 pb-40 pt-4">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/leren"
          aria-label="Quitter la leçon"
          className="shrink-0 rounded-full p-2"
          style={{ color: "var(--leren-ink-soft)" }}
          onClick={stopSpeaking}
        >
          <X size={28} aria-hidden />
        </Link>
        <div className="leren-bar flex-1">
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {step.kind === "discover" && (
          <Discover
            word={step.word}
            onNext={() => {
              const { id } = step.word;
              updateProgress((p) => markSeen(p, id));
              goNext();
            }}
          />
        )}
        {step.kind === "pick-word" && (
          <PickWord step={step} disabled={!!result} picked={result?.picked} onAnswer={answer} />
        )}
        {step.kind === "pick-image" && (
          <PickImage step={step} disabled={!!result} picked={result?.picked} onAnswer={answer} />
        )}
        {step.kind === "pick-audio" && (
          <PickAudio step={step} disabled={!!result} picked={result?.picked} onAnswer={answer} />
        )}
        {step.kind === "translate" && (
          <Translate step={step} disabled={!!result} picked={result?.picked} onAnswer={answer} />
        )}
        {step.kind === "sentence" && (
          <SentenceBuilder step={step} disabled={!!result} onAnswer={answer} />
        )}
      </div>

      {result && <Feedback result={result} step={step} onNext={goNext} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Écrans d'entrée et de sortie                                        */
/* ------------------------------------------------------------------ */

function Intro({ theme, onStart }: { theme: Theme; onStart: () => void }) {
  return (
    <div
      className={`leren-${theme.color} mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center`}
    >
      <div className="text-8xl leren-appear" aria-hidden>
        {theme.emoji}
      </div>
      <h1 className="mt-4 text-3xl font-extrabold">{theme.fr}</h1>
      <p className="mt-1 text-xl font-bold" style={{ color: "var(--t)" }}>
        {theme.nl}
      </p>
      <p className="mt-6 text-lg" style={{ color: "var(--leren-ink-soft)" }}>
        Une petite leçon de 5&nbsp;minutes. Écoute bien&nbsp;!
      </p>
      <button type="button" className="leren-primary mt-8" onClick={onStart}>
        C&apos;est parti&nbsp;! <ArrowRight size={24} aria-hidden />
      </button>
      <Link
        href="/leren"
        className="mt-6 text-base font-semibold underline"
        style={{ color: "var(--leren-ink-soft)" }}
      >
        Retour
      </Link>
    </div>
  );
}

function Done({
  theme,
  progress,
  starsBefore,
  correct,
  asked,
  onAgain,
}: {
  theme: Theme;
  progress: Progress;
  starsBefore: number;
  correct: number;
  asked: number;
  onAgain: () => void;
}) {
  const stars = themeStars(progress, theme);
  const gained = stars > starsBefore;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl leren-appear" aria-hidden>
        {gained ? "🎉" : "🐰"}
      </div>
      <h1 className="mt-4 text-3xl font-extrabold">Goed gedaan&nbsp;!</h1>
      <p className="mt-1 text-lg" style={{ color: "var(--leren-ink-soft)" }}>
        Bien joué&nbsp;!
      </p>

      <div className="mt-6 flex gap-2" aria-label={`${stars} étoiles sur 3`}>
        {[0, 1, 2].map((i) => (
          <Star
            key={i}
            size={48}
            aria-hidden
            className={i < stars ? "leren-appear" : undefined}
            fill={i < stars ? "var(--leren-star)" : "transparent"}
            color={i < stars ? "var(--leren-star)" : "var(--leren-line)"}
          />
        ))}
      </div>

      <p className="mt-6 text-xl font-bold">
        {correct} bonnes réponses sur {asked}
      </p>
      {progress.streak > 1 && (
        <p className="mt-2 text-lg">🔥 {progress.streak} jours de suite&nbsp;!</p>
      )}

      <button type="button" className="leren-primary leren-primary-good mt-8" onClick={onAgain}>
        Encore une leçon
      </button>
      <Link
        href="/leren"
        className="mt-6 text-base font-semibold underline"
        style={{ color: "var(--leren-ink-soft)" }}
      >
        Choisir un autre thème
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Les exercices                                                       */
/* ------------------------------------------------------------------ */

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-6 text-center text-xl font-bold"
      style={{ color: "var(--leren-ink-soft)" }}
    >
      {children}
    </p>
  );
}

/** Carte de découverte : on présente un mot nouveau, sans rien demander. */
function Discover({ word, onNext }: { word: Word; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Prompt>Un mot nouveau&nbsp;!</Prompt>
      <div className="text-8xl leren-appear" aria-hidden>
        {word.emoji}
      </div>
      <p className="mt-6 text-4xl font-extrabold">{fullNl(word)}</p>
      <p className="mt-2 text-xl" style={{ color: "var(--leren-ink-soft)" }}>
        {word.fr}
      </p>
      <div className="mt-6">
        <SpeakButton text={fullNl(word)} size="lg" />
      </div>
      <button type="button" className="leren-primary mt-10" onClick={onNext}>
        J&apos;ai compris <ArrowRight size={24} aria-hidden />
      </button>
    </div>
  );
}

type AnswerFn = (correct: boolean, picked: string) => void;

function choiceClass(
  disabled: boolean,
  picked: string | undefined,
  optionId: string,
  targetId: string
): string {
  if (!disabled) return "";
  if (optionId === targetId) return "leren-choice-good";
  if (optionId === picked) return "leren-choice-bad";
  return "leren-choice-dim";
}

/** On montre l'image, l'enfant choisit le mot écrit. */
function PickWord({
  step,
  disabled,
  picked,
  onAnswer,
}: {
  step: Extract<Step, { kind: "pick-word" }>;
  disabled: boolean;
  picked?: string;
  onAnswer: AnswerFn;
}) {
  return (
    <div className="flex flex-col items-center">
      <Prompt>Quel est ce mot&nbsp;?</Prompt>
      <div className="text-8xl" aria-hidden>
        {step.word.emoji}
      </div>
      <div className="mt-8 grid w-full gap-3">
        {step.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={disabled}
            className={`leren-choice p-4 text-2xl ${choiceClass(disabled, picked, choice.id, step.word.id)}`}
            onClick={() => {
              speak(fullNl(choice));
              onAnswer(choice.id === step.word.id, choice.id);
            }}
          >
            {fullNl(choice)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** On dit le mot, l'enfant choisit la bonne image. */
function PickImage({
  step,
  disabled,
  picked,
  onAnswer,
}: {
  step: Extract<Step, { kind: "pick-image" }>;
  disabled: boolean;
  picked?: string;
  onAnswer: AnswerFn;
}) {
  return (
    <div className="flex flex-col items-center">
      <Prompt>Écoute, puis touche la bonne image</Prompt>
      <SpeakButton text={step.word.nl} size="lg" label="Réécouter le mot" />
      <div className="mt-8 grid w-full grid-cols-2 gap-3">
        {step.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={disabled}
            aria-label={choice.fr}
            className={`leren-choice aspect-square text-6xl ${choiceClass(disabled, picked, choice.id, step.word.id)}`}
            onClick={() => onAnswer(choice.id === step.word.id, choice.id)}
          >
            <span aria-hidden>{choice.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * On montre l'image, l'enfant écoute plusieurs mots et désigne le bon.
 * Deux boutons par ligne : un pour écouter, un pour valider — pour qu'un
 * enfant puisse tout écouter avant de se décider.
 */
function PickAudio({
  step,
  disabled,
  picked,
  onAnswer,
}: {
  step: Extract<Step, { kind: "pick-audio" }>;
  disabled: boolean;
  picked?: string;
  onAnswer: AnswerFn;
}) {
  const [heard, setHeard] = useState<string[]>([]);

  return (
    <div className="flex flex-col items-center">
      <Prompt>Écoute les mots et choisis le bon</Prompt>
      <div className="text-8xl" aria-hidden>
        {step.word.emoji}
      </div>
      <div className="mt-8 flex w-full flex-col gap-3">
        {step.choices.map((choice, index) => {
          const played = heard.includes(choice.id);
          return (
            <div key={choice.id} className="flex items-center gap-3">
              <button
                type="button"
                disabled={disabled}
                aria-label={`Écouter le mot numéro ${index + 1}`}
                className={`leren-choice h-20 flex-1 text-2xl ${choiceClass(disabled, picked, choice.id, step.word.id)}`}
                onClick={() => {
                  speak(choice.nl);
                  setHeard((h) => (h.includes(choice.id) ? h : [...h, choice.id]));
                }}
              >
                <Volume2 size={32} aria-hidden />
                <span aria-hidden>{index + 1}</span>
              </button>
              <button
                type="button"
                disabled={disabled || !played}
                aria-label={`Choisir le mot numéro ${index + 1}`}
                className="leren-choice h-20 w-20 shrink-0"
                style={{
                  opacity: played || disabled ? 1 : 0.35,
                  borderColor: played ? "var(--leren-good)" : undefined,
                  boxShadow: played ? "0 5px 0 var(--leren-good)" : undefined,
                }}
                onClick={() => onAnswer(choice.id === step.word.id, choice.id)}
              >
                <Check size={32} aria-hidden color="var(--leren-good)" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** On montre le mot français, l'enfant choisit le mot néerlandais. */
function Translate({
  step,
  disabled,
  picked,
  onAnswer,
}: {
  step: Extract<Step, { kind: "translate" }>;
  disabled: boolean;
  picked?: string;
  onAnswer: AnswerFn;
}) {
  return (
    <div className="flex flex-col items-center">
      <Prompt>Comment dit-on en néerlandais&nbsp;?</Prompt>
      <p className="text-center text-4xl font-extrabold">{step.word.fr}</p>
      <div className="mt-8 grid w-full gap-3">
        {step.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={disabled}
            className={`leren-choice p-4 text-2xl ${choiceClass(disabled, picked, choice.id, step.word.id)}`}
            onClick={() => {
              speak(fullNl(choice));
              onAnswer(choice.id === step.word.id, choice.id);
            }}
          >
            {fullNl(choice)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** L'enfant remet une phrase dans l'ordre en touchant les mots. */
function SentenceBuilder({
  step,
  disabled,
  onAnswer,
}: {
  step: Extract<Step, { kind: "sentence" }>;
  disabled: boolean;
  onAnswer: AnswerFn;
}) {
  const [placed, setPlaced] = useState<number[]>([]);
  const complete = placed.length === step.tokens.length;

  function validate() {
    const built = placed.map((i) => step.tokens[i]).join(" ");
    onAnswer(built === step.sentence.nl, built);
  }

  return (
    <div className="flex flex-col items-center">
      <Prompt>Remets la phrase dans l&apos;ordre</Prompt>
      <p className="text-center text-2xl font-extrabold">{step.sentence.fr}</p>

      <div
        className="mt-6 flex min-h-20 w-full flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3"
        style={{ borderColor: "var(--leren-line)" }}
      >
        {placed.map((tokenIndex, position) => (
          <button
            key={`${tokenIndex}-${position}`}
            type="button"
            disabled={disabled}
            data-zone="placed"
            className="leren-choice px-4 py-2 text-xl"
            onClick={() => setPlaced((p) => p.filter((_, i) => i !== position))}
          >
            {step.tokens[tokenIndex]}
          </button>
        ))}
      </div>

      <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
        {step.tokens.map((token, index) =>
          placed.includes(index) ? null : (
            <button
              key={index}
              type="button"
              disabled={disabled}
              data-zone="pool"
              className="leren-choice px-4 py-2 text-xl"
              onClick={() => setPlaced((p) => [...p, index])}
            >
              {token}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="leren-primary mt-8"
        disabled={!complete || disabled}
        style={{ opacity: complete && !disabled ? 1 : 0.4 }}
        onClick={validate}
      >
        Vérifier
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Le bandeau de correction                                            */
/* ------------------------------------------------------------------ */

const CHEERS = ["Goed zo !", "Super !", "Prima !", "Bravo !", "Knap !"];

function Feedback({
  result,
  step,
  onNext,
}: {
  result: { correct: boolean; picked: string };
  step: Step;
  onNext: () => void;
}) {
  const cheer = useMemo(() => shuffle(CHEERS)[0], []);
  const answerText =
    step.kind === "sentence" ? step.sentence.nl : fullNl(step.word);
  const answerFr = step.kind === "sentence" ? step.sentence.fr : step.word.fr;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-10 border-t-4 px-4 py-4"
      style={{
        background: result.correct ? "var(--leren-good-soft)" : "var(--leren-bad-soft)",
        borderColor: result.correct ? "var(--leren-good)" : "var(--leren-bad)",
      }}
      role="status"
    >
      <div className="mx-auto flex w-full max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-2xl font-extrabold"
            style={{ color: result.correct ? "var(--leren-good)" : "var(--leren-bad)" }}
          >
            {result.correct ? `${cheer} 🎉` : "Presque !"}
          </p>
          <p className="mt-1 truncate text-lg font-bold">{answerText}</p>
          <p className="truncate text-base" style={{ color: "var(--leren-ink-soft)" }}>
            {answerFr}
          </p>
        </div>
        <SpeakButton text={answerText} size="sm" />
        {!result.correct && (
          <button type="button" className="leren-primary px-6 py-3 text-base" onClick={onNext}>
            Continuer
          </button>
        )}
      </div>
    </div>
  );
}
