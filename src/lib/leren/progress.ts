import type { Theme } from "./types";

/**
 * LA MÉMOIRE DE L'ENFANT.
 *
 * On utilise la méthode des "boîtes de Leitner", la technique de mémorisation
 * la plus éprouvée pour le vocabulaire :
 *
 *   - chaque mot est rangé dans une boîte, de 0 (jamais su) à 5 (bien su) ;
 *   - une bonne réponse fait monter le mot d'une boîte ;
 *   - une erreur le fait redescendre d'une boîte ;
 *   - plus la boîte est haute, plus le mot met de temps à revenir.
 *
 * Résultat : l'enfant révise beaucoup les mots qu'il rate, et presque plus
 * ceux qu'il maîtrise. C'est ça qui fait la différence avec une simple liste.
 *
 * Tout est enregistré dans le navigateur (localStorage) : pas de compte,
 * pas de serveur, pas de données personnelles qui sortent de l'appareil.
 */

const STORAGE_KEY = "leren-nl-v1";

/** Délai avant de revoir un mot, en jours, selon sa boîte (0 → 5). */
const BOX_DELAY_DAYS = [0, 1, 2, 4, 8, 21];
export const MAX_BOX = 5;
/** À partir de cette boîte, on considère le mot comme acquis. */
export const MASTERED_BOX = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export type WordState = {
  /** Boîte de Leitner, de 0 à MAX_BOX. */
  box: number;
  /** Date (timestamp) à partir de laquelle le mot doit être revu. */
  due: number;
  /** Nombre de fois où le mot a été proposé. */
  seen: number;
};

export type Progress = {
  version: 1;
  words: Record<string, WordState>;
  /** Nombre de leçons terminées, par thème. */
  lessons: Record<string, number>;
  /** Nombre de jours d'affilée avec au moins une leçon terminée. */
  streak: number;
  /** Dernier jour d'activité, au format "2026-07-26". */
  lastDay: string | null;
  /** L'enfant sait-il lire ? Si non, tout passe par l'image et le son. */
  reader: boolean;
  /** Le prénom de l'enfant, juste pour dire bonjour. */
  name: string;
  /** La question de départ (sait lire ou non) a-t-elle déjà été posée ? */
  setupDone: boolean;
};

export function emptyProgress(): Progress {
  return {
    version: 1,
    words: {},
    lessons: {},
    streak: 0,
    lastDay: null,
    reader: true,
    name: "",
    setupDone: false,
  };
}

/* ------------------------------------------------------------------ */
/* Sauvegarde                                                          */
/* ------------------------------------------------------------------ */

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (parsed.version !== 1) return emptyProgress();
    return { ...emptyProgress(), ...parsed };
  } catch {
    // Navigation privée, stockage plein, données abîmées : on repart de zéro
    // plutôt que de planter l'application au nez de l'enfant.
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Rien à faire : l'enfant peut continuer à jouer, seule la
    // sauvegarde est perdue.
  }
}

/* ------------------------------------------------------------------ */
/* Mise à jour après une réponse                                       */
/* ------------------------------------------------------------------ */

export function wordState(progress: Progress, wordId: string): WordState {
  return progress.words[wordId] ?? { box: 0, due: 0, seen: 0 };
}

/** Renvoie un nouvel objet Progress tenant compte de la réponse donnée. */
export function recordAnswer(
  progress: Progress,
  wordId: string,
  correct: boolean,
  now = Date.now()
): Progress {
  const current = wordState(progress, wordId);
  const box = correct
    ? Math.min(MAX_BOX, current.box + 1)
    : Math.max(0, current.box - 1);

  return {
    ...progress,
    words: {
      ...progress.words,
      [wordId]: {
        box,
        due: now + BOX_DELAY_DAYS[box] * DAY_MS,
        seen: current.seen + 1,
      },
    },
  };
}

/**
 * Marque un mot comme "déjà rencontré" sans le juger : c'est ce qui se
 * passe sur une carte de découverte, où l'enfant ne répond à rien.
 */
export function markSeen(
  progress: Progress,
  wordId: string,
  now = Date.now()
): Progress {
  const current = wordState(progress, wordId);
  return {
    ...progress,
    words: {
      ...progress.words,
      [wordId]: { box: current.box, due: now, seen: current.seen + 1 },
    },
  };
}

/** Le mot doit-il être revu maintenant ? */
export function isDue(progress: Progress, wordId: string, now = Date.now()): boolean {
  const state = progress.words[wordId];
  if (!state) return false; // jamais vu : ce n'est pas une révision, c'est une découverte
  return state.due <= now;
}

/* ------------------------------------------------------------------ */
/* Fin de leçon : série de jours et étoiles                            */
/* ------------------------------------------------------------------ */

function today(now = Date.now()): string {
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** À appeler quand une leçon vient d'être terminée. */
export function completeLesson(
  progress: Progress,
  themeId: string,
  now = Date.now()
): Progress {
  const day = today(now);
  const yesterday = today(now - DAY_MS);

  let streak = progress.streak;
  if (progress.lastDay === day) {
    // Déjà joué aujourd'hui : la série ne bouge pas.
  } else if (progress.lastDay === yesterday) {
    streak = progress.streak + 1;
  } else {
    streak = 1;
  }

  return {
    ...progress,
    streak,
    lastDay: day,
    lessons: {
      ...progress.lessons,
      [themeId]: (progress.lessons[themeId] ?? 0) + 1,
    },
  };
}

/** Part des mots du thème considérés comme acquis, entre 0 et 1. */
export function themeRatio(progress: Progress, theme: Theme): number {
  if (theme.words.length === 0) return 0;
  const mastered = theme.words.filter(
    (w) => wordState(progress, w.id).box >= MASTERED_BOX
  ).length;
  return mastered / theme.words.length;
}

/** 0, 1, 2 ou 3 étoiles pour un thème. */
export function themeStars(progress: Progress, theme: Theme): number {
  const ratio = themeRatio(progress, theme);
  if (ratio >= 1) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio >= 0.3) return 1;
  return 0;
}

export function totalStars(progress: Progress, themes: Theme[]): number {
  return themes.reduce((sum, t) => sum + themeStars(progress, t), 0);
}

/** Nombre de mots déjà rencontrés au moins une fois, tous thèmes confondus. */
export function knownWordCount(progress: Progress): number {
  return Object.values(progress.words).filter((s) => s.seen > 0).length;
}
