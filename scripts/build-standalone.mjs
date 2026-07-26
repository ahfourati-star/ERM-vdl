/**
 * Fabrique une version autonome de l'application /leren : un seul fichier
 * HTML, sans serveur, sans installation, qui s'ouvre d'un double-clic ou
 * se met en ligne tel quel.
 *
 * Le vocabulaire n'est PAS recopié : il est lu depuis
 * `src/lib/leren/vocabulary.ts`, la seule source de vérité. Ajouter un mot
 * là-bas puis relancer cette commande suffit à mettre à jour les deux
 * versions de l'application.
 *
 * Utilisation :
 *   npm run build:standalone
 *
 * Résultat :
 *   public/leren-jouer.html
 *   (également servi par le site à l'adresse /leren-jouer.html)
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const { THEMES } = await import(join(root, "src/lib/leren/vocabulary.ts"));

const template = await readFile(join(here, "standalone/template.html"), "utf8");

if (!template.includes("__THEMES_JSON__")) {
  throw new Error("Le gabarit ne contient pas le repère __THEMES_JSON__.");
}

const html = template.replace("__THEMES_JSON__", JSON.stringify(THEMES));

const output = join(root, "public/leren-jouer.html");
await writeFile(output, html, "utf8");

const words = THEMES.reduce((n, theme) => n + theme.words.length, 0);
const kilobytes = Math.round(Buffer.byteLength(html, "utf8") / 1024);

console.log(`✓ ${output}`);
console.log(`  ${THEMES.length} thèmes, ${words} mots, ${kilobytes} Ko`);
