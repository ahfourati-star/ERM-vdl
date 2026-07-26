import type { Sentence, Theme, Word } from "./types";
import { isDue, MASTERED_BOX, wordState, type Progress } from "./progress";

/**
 * LA CONSTRUCTION D'UNE LEÇON.
 *
 * Une leçon = une dizaine d'étapes courtes, jamais plus de 5 minutes.
 * On mélange :
 *   - des mots nouveaux (précédés d'une carte "découverte") ;
 *   - des mots déjà vus qu'il est temps de réviser ;
 *   - une ou deux phrases à remettre dans l'ordre, pour finir.
 *
 * Le type d'exercice dépend du niveau de l'enfant sur ce mot : on commence
 * toujours par reconnaître, et on ne demande de produire que plus tard.
 */

export type Step =
  /** Carte de découverte : image + mot + son, l'enfant appuie pour continuer. */
  | { kind: "discover"; word: Word }
  /** On montre l'image, l'enfant choisit le bon mot écrit. */
  | { kind: "pick-word"; word: Word; choices: Word[] }
  /** On dit le mot, l'enfant choisit la bonne image. */
  | { kind: "pick-image"; word: Word; choices: Word[] }
  /** On montre l'image, l'enfant écoute 3 sons et choisit le bon. */
  | { kind: "pick-audio"; word: Word; choices: Word[] }
  /** On montre le mot français, l'enfant choisit le mot néerlandais. */
  | { kind: "translate"; word: Word; choices: Word[] }
  /** L'enfant remet une phrase dans l'ordre. */
  | { kind: "sentence"; sentence: Sentence; tokens: string[] };

/** Nombre de mots travaillés dans une leçon. */
const WORDS_PER_LESSON = 8;
/** Dont, au maximum, ce nombre de mots jamais vus. */
const NEW_WORDS_PER_LESSON = 4;

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Choisit des mots "pièges" plausibles : ils viennent du même thème,
 * pour que l'enfant doive vraiment reconnaître le mot et pas juste
 * éliminer l'intrus.
 */
function buildChoices(target: Word, pool: Word[], count: number): Word[] {
  const others = shuffle(pool.filter((w) => w.id !== target.id)).slice(0, count - 1);
  return shuffle([target, ...others]);
}

/** Découpe une phrase en mots mélangés, à remettre dans l'ordre. */
function tokenize(sentence: Sentence): string[] {
  return shuffle(sentence.nl.split(" "));
}

/**
 * Le type d'exercice à proposer pour un mot donné, selon ce que l'enfant
 * en sait déjà et selon qu'il sait lire ou non.
 */
function exerciseFor(word: Word, box: number, pool: Word[], reader: boolean): Step {
  if (!reader) {
    // Enfant qui ne lit pas encore : uniquement de l'image et du son.
    return box <= 1
      ? { kind: "pick-image", word, choices: buildChoices(word, pool, 4) }
      : { kind: "pick-audio", word, choices: buildChoices(word, pool, 3) };
  }

  if (box <= 0) return { kind: "pick-word", word, choices: buildChoices(word, pool, 3) };
  if (box === 1) return { kind: "pick-image", word, choices: buildChoices(word, pool, 4) };
  if (box === 2) return { kind: "pick-word", word, choices: buildChoices(word, pool, 4) };
  return { kind: "translate", word, choices: buildChoices(word, pool, 4) };
}

/**
 * Version plus facile d'un exercice, proposée quand l'enfant s'est trompé :
 * on ne le remet jamais face au même mur deux fois de suite.
 */
export function easierStep(step: Step, pool: Word[], reader: boolean): Step {
  if (step.kind === "sentence") return step;
  const word = step.word;
  if (!reader) return { kind: "pick-image", word, choices: buildChoices(word, pool, 3) };
  if (step.kind === "translate" || step.kind === "pick-audio") {
    return { kind: "pick-word", word, choices: buildChoices(word, pool, 4) };
  }
  return { kind: "pick-image", word, choices: buildChoices(word, pool, 3) };
}

export function buildSession(
  theme: Theme,
  progress: Progress,
  now = Date.now()
): Step[] {
  const reader = progress.reader;
  const pool = theme.words;

  const neverSeen = pool.filter((w) => wordState(progress, w.id).seen === 0);
  const toReview = pool.filter((w) => isDue(progress, w.id, now));
  // Si rien n'est à réviser et qu'il n'y a plus de mot neuf, on retravaille
  // les mots les moins solides : une leçon n'est jamais vide.
  const weakest = [...pool].sort(
    (a, b) => wordState(progress, a.id).box - wordState(progress, b.id).box
  );

  const newWords = shuffle(neverSeen).slice(0, NEW_WORDS_PER_LESSON);
  const reviewWords = shuffle(toReview)
    .filter((w) => !newWords.includes(w))
    .slice(0, WORDS_PER_LESSON - newWords.length);

  const selected = [...newWords, ...reviewWords];
  for (const word of weakest) {
    if (selected.length >= WORDS_PER_LESSON) break;
    if (!selected.includes(word)) selected.push(word);
  }

  const steps: Step[] = [];

  // Les mots nouveaux : on les présente, puis on les teste tout de suite.
  for (const word of newWords) {
    steps.push({ kind: "discover", word });
    steps.push(
      reader
        ? { kind: "pick-word", word, choices: buildChoices(word, pool, 3) }
        : { kind: "pick-image", word, choices: buildChoices(word, pool, 3) }
    );
  }

  // Les révisions, mélangées.
  const reviewSteps = selected
    .filter((w) => !newWords.includes(w))
    .map((word) => exerciseFor(word, wordState(progress, word.id).box, pool, reader));
  steps.push(...shuffle(reviewSteps));

  // Une deuxième passe sur les mots nouveaux, en fin de leçon : c'est là que
  // se joue la mémorisation à court terme.
  for (const word of shuffle(newWords)) {
    steps.push(
      reader
        ? { kind: "pick-image", word, choices: buildChoices(word, pool, 4) }
        : { kind: "pick-audio", word, choices: buildChoices(word, pool, 3) }
    );
  }

  // La phrase bonus, réservée aux enfants qui lisent et qui connaissent
  // déjà une bonne partie du thème.
  const mastered = pool.filter(
    (w) => wordState(progress, w.id).box >= MASTERED_BOX
  ).length;
  if (reader && theme.sentences.length > 0 && mastered >= 4) {
    const sentence = shuffle(theme.sentences)[0];
    steps.push({ kind: "sentence", sentence, tokens: tokenize(sentence) });
  }

  return steps;
}

/** Le mot travaillé par une étape, s'il y en a un. */
export function stepWord(step: Step): Word | null {
  return step.kind === "sentence" ? null : step.word;
}
