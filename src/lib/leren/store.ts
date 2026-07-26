"use client";

import { useSyncExternalStore } from "react";
import { emptyProgress, loadProgress, saveProgress, type Progress } from "./progress";

/**
 * LE PONT ENTRE LE NAVIGATEUR ET REACT.
 *
 * La progression vit dans le stockage du navigateur, qui est un "système
 * extérieur" à React. On l'expose donc comme une source de données que les
 * composants peuvent lire et écouter, plutôt que de la recopier dans l'état
 * de chaque écran.
 */

let cache: Progress | null = null;
const listeners = new Set<() => void>();

/** Valeur utilisée pendant le rendu côté serveur (pas de stockage là-bas). */
const SERVER_SNAPSHOT = emptyProgress();

function getSnapshot(): Progress {
  if (!cache) cache = loadProgress();
  return cache;
}

function getServerSnapshot(): Progress {
  return SERVER_SNAPSHOT;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Met à jour la progression, l'enregistre, et prévient tous les écrans. */
export function updateProgress(update: Progress | ((current: Progress) => Progress)): void {
  const next = typeof update === "function" ? update(getSnapshot()) : update;
  cache = next;
  saveProgress(next);
  for (const listener of listeners) listener();
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------------------------------------------ */

const noopSubscribe = () => () => {};

/**
 * Vrai une fois que la page tourne dans le navigateur. Avant ça, la
 * progression n'est pas lisible : on affiche un écran d'attente plutôt
 * qu'une page fausse qui changerait sous les yeux de l'enfant.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
