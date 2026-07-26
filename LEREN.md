# Nederlands leren — apprendre le néerlandais aux enfants

Un petit jeu pour apprendre le néerlandais à un enfant francophone débutant.
Il vit dans ce dépôt, à l'adresse **`/leren`**, complètement séparé de
l'application de gestion des risques (`/dashboard`), qu'il ne touche pas.

## Comment l'ouvrir

```bash
npm install     # une seule fois
npm run dev     # démarre le site
```

Puis ouvrez **http://localhost:3000/leren** dans le navigateur.

Le jeu ne demande ni compte, ni mot de passe, ni base de données : il
fonctionne même si l'application de gestion des risques n'est pas configurée.

## Ce que fait l'application

- **11 thèmes du quotidien** (couleurs, nombres, animaux, nourriture, famille,
  corps, maison, école, vêtements, météo, jouets), soit environ 115 mots.
- **5 types d'exercices** : découverte d'un mot nouveau, image → mot,
  son → image, son → choix d'écoute, mot français → mot néerlandais, et
  remise en ordre d'une phrase.
- **Le son partout.** Chaque mot est prononcé en néerlandais par la voix
  installée sur l'appareil. C'est le point le plus important : le néerlandais
  a des sons qu'un enfant francophone ne peut pas deviner à l'écrit.
- **Deux modes selon l'enfant.** S'il ne sait pas encore lire, les exercices
  écrits disparaissent au profit d'exercices d'image et d'écoute.
- **Une mémoire.** Chaque mot est rangé dans une « boîte » de 0 à 5. Une bonne
  réponse le fait monter, une erreur le fait redescendre. Plus la boîte est
  haute, plus le mot met de temps à revenir : 1 jour, 2, 4, 8, puis 3 semaines.
  L'enfant révise donc surtout ce qu'il ne sait pas encore.
- **Des étoiles et une série de jours** pour donner envie de revenir.

Une leçon dure environ 5 minutes et travaille 8 mots, dont 4 nouveaux au
maximum. Un mot raté revient plus loin dans la même leçon, sous une forme plus
facile : l'enfant ne termine jamais sur un échec.

## Où sont les choses

| Je veux…                                   | Fichier à ouvrir                      |
| ------------------------------------------ | ------------------------------------- |
| ajouter ou corriger des mots, des thèmes    | `src/lib/leren/vocabulary.ts`         |
| changer les couleurs, la taille des boutons | `src/app/leren/leren.css`             |
| régler la mémorisation (délais, étoiles)    | `src/lib/leren/progress.ts`           |
| changer le contenu d'une leçon              | `src/lib/leren/session.ts`            |
| modifier la voix (vitesse, accent)          | `src/lib/leren/speech.ts`             |
| modifier la page d'accueil                  | `src/components/leren/Home.tsx`       |
| modifier les exercices à l'écran            | `src/components/leren/Lesson.tsx`     |
| modifier l'espace parents                   | `src/components/leren/Parents.tsx`    |

### Ajouter un mot

Ouvrez `src/lib/leren/vocabulary.ts`, trouvez le thème voulu, et recopiez une
ligne existante :

```ts
{ nl: "hond", art: "de", fr: "le chien", emoji: "🐶" },
```

- `nl` : le mot néerlandais, **sans** l'article
- `art` : `"de"`, `"het"`, ou `null` si le mot n'a pas d'article
- `fr` : la traduction française, **avec** l'article
- `emoji` : l'image du mot (copiez-collez un emoji)

Choisissez toujours un emoji bien différent des autres du même thème : l'enfant
doit pouvoir le distinguer d'un coup d'œil.

## Le son ne marche pas ?

L'application utilise la voix néerlandaise installée sur l'appareil. Si aucune
n'est présente, le mot est lu avec l'accent de la langue par défaut, ce qui
n'aide pas. L'**espace parents** (`/leren/parents`) contient un bouton de test
et la marche à suivre pour installer une voix néerlandaise sur Android, iPhone,
Windows et Mac.

## Les données de l'enfant

Tout est enregistré dans le navigateur de l'appareil (`localStorage`), sous la
clé `leren-nl-v1`. Rien n'est envoyé sur internet, il n'y a ni compte ni
serveur. En contrepartie, la progression ne suit pas d'un appareil à l'autre,
et vider l'historique du navigateur l'efface.

## Pistes pour la suite

- de vraies voix enregistrées, plutôt que la synthèse vocale de l'appareil ;
- des thèmes supplémentaires (les salutations, les métiers, la ville) ;
- un mode « deux joueurs » pour jouer contre un frère ou une sœur ;
- une installation sur l'écran d'accueil du téléphone (application web) ;
- un suivi parent multi-appareils, qui demanderait alors un compte et une
  base de données.
