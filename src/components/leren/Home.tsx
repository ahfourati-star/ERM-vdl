"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BookOpen, Ear, Flame, Star } from "lucide-react";
import { THEMES } from "@/lib/leren/vocabulary";
import {
  knownWordCount,
  themeRatio,
  themeStars,
  totalStars,
} from "@/lib/leren/progress";
import { updateProgress, useHydrated, useProgress } from "@/lib/leren/store";
import { initSpeech } from "@/lib/leren/speech";

/**
 * La page d'accueil : le "chemin" des thèmes.
 * L'enfant voit d'un coup d'œil où il en est et ce qu'il peut faire ensuite.
 */
export function LerenHome() {
  const hydrated = useHydrated();
  const progress = useProgress();

  // On prépare la voix néerlandaise dès l'arrivée sur la page : dans certains
  // navigateurs, la liste des voix met un instant à être disponible.
  useEffect(() => {
    initSpeech();
  }, []);

  if (!hydrated) {
    return <div className="p-8 text-center text-lg">Un instant…</div>;
  }

  if (!progress.setupDone) {
    return (
      <Setup
        onDone={(reader) => updateProgress({ ...progress, reader, setupDone: true })}
      />
    );
  }

  const stars = totalStars(progress, THEMES);
  const maxStars = THEMES.length * 3;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
      <header className="mb-6 text-center">
        <div className="text-6xl leren-appear" aria-hidden>
          🐰
        </div>
        <h1 className="mt-2 text-3xl font-extrabold">
          {progress.name ? `Hallo ${progress.name} !` : "Hallo !"}
        </h1>
        <p className="mt-1 text-lg" style={{ color: "var(--leren-ink-soft)" }}>
          On apprend le néerlandais&nbsp;?
        </p>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat
          icon={<Flame size={22} aria-hidden />}
          value={progress.streak}
          label="jours de suite"
        />
        <Stat
          icon={<Star size={22} aria-hidden />}
          value={`${stars}/${maxStars}`}
          label="étoiles"
        />
        <Stat
          icon={<BookOpen size={22} aria-hidden />}
          value={knownWordCount(progress)}
          label="mots vus"
        />
      </div>

      <ul className="flex flex-col gap-3">
        {THEMES.map((theme) => {
          const themeStarCount = themeStars(progress, theme);
          const ratio = themeRatio(progress, theme);
          return (
            <li key={theme.id}>
              <Link href={`/leren/${theme.id}`} className={`leren-theme-card leren-${theme.color}`}>
                <span className="text-5xl" aria-hidden>
                  {theme.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-extrabold">{theme.fr}</span>
                  <span
                    className="block text-base font-semibold"
                    style={{ color: "var(--leren-ink-soft)" }}
                  >
                    {theme.nl}
                  </span>
                  <span className="leren-bar mt-2 block">
                    <span style={{ width: `${Math.round(ratio * 100)}%` }} />
                  </span>
                </span>
                <span
                  className="flex shrink-0 flex-col gap-0.5"
                  aria-label={`${themeStarCount} étoile${themeStarCount > 1 ? "s" : ""} sur 3`}
                >
                  {[0, 1, 2].map((i) => (
                    <Star
                      key={i}
                      size={20}
                      aria-hidden
                      fill={i < themeStarCount ? "var(--leren-star)" : "transparent"}
                      color={i < themeStarCount ? "var(--leren-star)" : "var(--leren-ink-soft)"}
                    />
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-3">
        <ReaderToggle
          reader={progress.reader}
          onChange={(reader) => updateProgress({ ...progress, reader })}
        />
        <Link
          href="/leren/parents"
          className="text-base font-semibold underline"
          style={{ color: "var(--leren-ink-soft)" }}
        >
          Espace parents
        </Link>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border-2 px-2 py-3"
      style={{ borderColor: "var(--leren-line)", background: "var(--leren-card)" }}
    >
      <span style={{ color: "var(--leren-accent)" }}>{icon}</span>
      <span className="mt-1 text-2xl font-extrabold leading-none">{value}</span>
      <span
        className="mt-1 text-center text-xs font-semibold"
        style={{ color: "var(--leren-ink-soft)" }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Le choix "je sais lire / pas encore" change complètement les exercices
 * proposés, donc on le pose dès la première visite.
 */
function Setup({ onDone }: { onDone: (reader: boolean) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 text-center">
      <div className="text-7xl leren-appear" aria-hidden>
        🐰
      </div>
      <h1 className="mt-4 text-3xl font-extrabold">Bonjour&nbsp;!</h1>
      <p className="mt-2 text-lg">
        Je suis Bram, et je parle néerlandais. Avant de commencer, dis-moi&nbsp;:
      </p>
      <div className="mt-8 flex w-full flex-col gap-4">
        <button type="button" className="leren-choice p-5 text-xl" onClick={() => onDone(true)}>
          <BookOpen size={28} aria-hidden />
          Je sais lire
        </button>
        <button type="button" className="leren-choice p-5 text-xl" onClick={() => onDone(false)}>
          <Ear size={28} aria-hidden />
          Pas encore
        </button>
      </div>
      <p className="mt-6 text-sm" style={{ color: "var(--leren-ink-soft)" }}>
        Si l&apos;enfant ne lit pas encore, tous les exercices passent par
        l&apos;image et par le son. On peut changer ce choix à tout moment.
      </p>
    </div>
  );
}

function ReaderToggle({
  reader,
  onChange,
}: {
  reader: boolean;
  onChange: (reader: boolean) => void;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-full border-2 p-1"
      style={{ borderColor: "var(--leren-line)", background: "var(--leren-card)" }}
    >
      <Chip active={!reader} onClick={() => onChange(false)}>
        <Ear size={18} aria-hidden /> Je ne lis pas
      </Chip>
      <Chip active={reader} onClick={() => onChange(true)}>
        <BookOpen size={18} aria-hidden /> Je lis
      </Chip>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold"
      style={{
        background: active ? "var(--leren-accent)" : "transparent",
        color: active ? "#fff" : "var(--leren-ink-soft)",
      }}
    >
      {children}
    </button>
  );
}
