/**
 * Types de base de l'application "Leren" (apprendre le néerlandais).
 *
 * Tout est en mémoire / dans le navigateur : aucune base de données,
 * aucun compte utilisateur. Voir `progress.ts` pour la sauvegarde.
 */

/** En néerlandais, chaque nom a un article : "de" ou "het". */
export type Article = "de" | "het" | null;

export type Word = {
  /** Identifiant unique, construit automatiquement : "dieren:hond" */
  id: string;
  /** Le mot néerlandais, sans son article. Ex : "hond" */
  nl: string;
  /** "de", "het", ou null pour les mots qui n'en ont pas (couleurs, nombres). */
  art: Article;
  /** La traduction française, article compris. Ex : "le chien" */
  fr: string;
  /** L'image du mot. On utilise des emojis : pas de fichier à héberger. */
  emoji: string;
  /** Le thème auquel le mot appartient. */
  themeId: string;
};

export type Sentence = {
  id: string;
  /** La phrase néerlandaise. Ex : "De hond is groot." */
  nl: string;
  /** Sa traduction. Ex : "Le chien est grand." */
  fr: string;
  themeId: string;
};

export type Theme = {
  /** Identifiant utilisé dans l'adresse : /leren/dieren */
  id: string;
  /** Le nom du thème en néerlandais. Ex : "De dieren" */
  nl: string;
  /** Le nom du thème en français. Ex : "Les animaux" */
  fr: string;
  /** L'emoji affiché sur la carte du thème. */
  emoji: string;
  /** La couleur de la carte (voir `leren.css`). */
  color: string;
  words: Word[];
  sentences: Sentence[];
};

/** Le mot néerlandais complet, article compris. Ex : "de hond" */
export function fullNl(word: Word): string {
  return word.art ? `${word.art} ${word.nl}` : word.nl;
}
