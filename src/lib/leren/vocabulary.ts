import type { Article, Sentence, Theme, Word } from "./types";

/**
 * TOUT LE VOCABULAIRE DE L'APPLICATION EST DANS CE FICHIER.
 *
 * Pour ajouter un mot : recopiez une ligne existante et changez les valeurs.
 *   { nl: "hond", art: "de", fr: "le chien", emoji: "🐶" }
 *     nl    = le mot néerlandais, SANS l'article
 *     art   = "de", "het", ou null si le mot n'a pas d'article
 *     fr    = la traduction française, AVEC l'article
 *     emoji = l'image du mot (copiez-collez un emoji)
 *
 * Pour ajouter un thème : recopiez un bloc `theme(...)` complet et ajoutez-le
 * à la liste `THEMES` tout en bas du fichier.
 *
 * Choisissez toujours des emojis bien différents à l'intérieur d'un même
 * thème : l'enfant doit pouvoir les distinguer d'un coup d'œil.
 */

type RawWord = { nl: string; art: Article; fr: string; emoji: string };
type RawSentence = { nl: string; fr: string };

function theme(
  id: string,
  nl: string,
  fr: string,
  emoji: string,
  color: string,
  words: RawWord[],
  sentences: RawSentence[]
): Theme {
  return {
    id,
    nl,
    fr,
    emoji,
    color,
    words: words.map<Word>((w) => ({ ...w, id: `${id}:${w.nl}`, themeId: id })),
    sentences: sentences.map<Sentence>((s, i) => ({
      ...s,
      id: `${id}:s${i}`,
      themeId: id,
    })),
  };
}

const kleuren = theme(
  "kleuren",
  "De kleuren",
  "Les couleurs",
  "🎨",
  "rose",
  [
    { nl: "rood", art: null, fr: "rouge", emoji: "🔴" },
    { nl: "blauw", art: null, fr: "bleu", emoji: "🔵" },
    { nl: "geel", art: null, fr: "jaune", emoji: "🟡" },
    { nl: "groen", art: null, fr: "vert", emoji: "🟢" },
    { nl: "zwart", art: null, fr: "noir", emoji: "⚫" },
    { nl: "wit", art: null, fr: "blanc", emoji: "⚪" },
    { nl: "oranje", art: null, fr: "orange", emoji: "🟠" },
    { nl: "paars", art: null, fr: "violet", emoji: "🟣" },
    { nl: "bruin", art: null, fr: "brun", emoji: "🟤" },
    { nl: "roze", art: null, fr: "rose", emoji: "🩷" },
  ],
  [
    { nl: "De bal is rood.", fr: "Le ballon est rouge." },
    { nl: "Het gras is groen.", fr: "L'herbe est verte." },
    { nl: "Ik hou van blauw.", fr: "J'aime le bleu." },
  ]
);

const getallen = theme(
  "getallen",
  "De getallen",
  "Les nombres",
  "🔢",
  "amber",
  [
    { nl: "een", art: null, fr: "un", emoji: "1️⃣" },
    { nl: "twee", art: null, fr: "deux", emoji: "2️⃣" },
    { nl: "drie", art: null, fr: "trois", emoji: "3️⃣" },
    { nl: "vier", art: null, fr: "quatre", emoji: "4️⃣" },
    { nl: "vijf", art: null, fr: "cinq", emoji: "5️⃣" },
    { nl: "zes", art: null, fr: "six", emoji: "6️⃣" },
    { nl: "zeven", art: null, fr: "sept", emoji: "7️⃣" },
    { nl: "acht", art: null, fr: "huit", emoji: "8️⃣" },
    { nl: "negen", art: null, fr: "neuf", emoji: "9️⃣" },
    { nl: "tien", art: null, fr: "dix", emoji: "🔟" },
  ],
  [
    { nl: "Ik zie drie katten.", fr: "Je vois trois chats." },
    { nl: "Wij zijn met twee.", fr: "Nous sommes deux." },
    { nl: "Ik tel tot tien.", fr: "Je compte jusqu'à dix." },
  ]
);

const dieren = theme(
  "dieren",
  "De dieren",
  "Les animaux",
  "🐘",
  "green",
  [
    { nl: "hond", art: "de", fr: "le chien", emoji: "🐶" },
    { nl: "kat", art: "de", fr: "le chat", emoji: "🐱" },
    { nl: "paard", art: "het", fr: "le cheval", emoji: "🐴" },
    { nl: "koe", art: "de", fr: "la vache", emoji: "🐮" },
    { nl: "varken", art: "het", fr: "le cochon", emoji: "🐷" },
    { nl: "kip", art: "de", fr: "la poule", emoji: "🐔" },
    { nl: "schaap", art: "het", fr: "le mouton", emoji: "🐑" },
    { nl: "vis", art: "de", fr: "le poisson", emoji: "🐟" },
    { nl: "vogel", art: "de", fr: "l'oiseau", emoji: "🐦" },
    { nl: "muis", art: "de", fr: "la souris", emoji: "🐭" },
    { nl: "beer", art: "de", fr: "l'ours", emoji: "🐻" },
    { nl: "olifant", art: "de", fr: "l'éléphant", emoji: "🐘" },
  ],
  [
    { nl: "De hond is groot.", fr: "Le chien est grand." },
    { nl: "Ik zie een kat.", fr: "Je vois un chat." },
    { nl: "Het paard loopt snel.", fr: "Le cheval court vite." },
  ]
);

const eten = theme(
  "eten",
  "Het eten",
  "La nourriture",
  "🍎",
  "red",
  [
    { nl: "brood", art: "het", fr: "le pain", emoji: "🍞" },
    { nl: "appel", art: "de", fr: "la pomme", emoji: "🍎" },
    { nl: "banaan", art: "de", fr: "la banane", emoji: "🍌" },
    { nl: "melk", art: "de", fr: "le lait", emoji: "🥛" },
    { nl: "water", art: "het", fr: "l'eau", emoji: "💧" },
    { nl: "kaas", art: "de", fr: "le fromage", emoji: "🧀" },
    { nl: "ei", art: "het", fr: "l'œuf", emoji: "🥚" },
    { nl: "soep", art: "de", fr: "la soupe", emoji: "🍲" },
    { nl: "koek", art: "de", fr: "le biscuit", emoji: "🍪" },
    { nl: "snoep", art: "het", fr: "le bonbon", emoji: "🍬" },
    { nl: "aardbei", art: "de", fr: "la fraise", emoji: "🍓" },
    { nl: "wortel", art: "de", fr: "la carotte", emoji: "🥕" },
  ],
  [
    { nl: "Ik eet een appel.", fr: "Je mange une pomme." },
    { nl: "Ik drink melk.", fr: "Je bois du lait." },
    { nl: "Het brood is lekker.", fr: "Le pain est bon." },
  ]
);

const familie = theme(
  "familie",
  "De familie",
  "La famille",
  "👨‍👩‍👧‍👦",
  "orange",
  [
    { nl: "mama", art: "de", fr: "la maman", emoji: "👩" },
    { nl: "papa", art: "de", fr: "le papa", emoji: "👨" },
    { nl: "broer", art: "de", fr: "le frère", emoji: "👦" },
    { nl: "zus", art: "de", fr: "la sœur", emoji: "👧" },
    { nl: "oma", art: "de", fr: "la grand-mère", emoji: "👵" },
    { nl: "opa", art: "de", fr: "le grand-père", emoji: "👴" },
    { nl: "baby", art: "de", fr: "le bébé", emoji: "👶" },
    { nl: "gezin", art: "het", fr: "la famille", emoji: "👨‍👩‍👧‍👦" },
    { nl: "vriend", art: "de", fr: "l'ami", emoji: "🧒" },
    { nl: "vriendin", art: "de", fr: "l'amie", emoji: "🙋‍♀️" },
  ],
  [
    { nl: "Mijn mama is lief.", fr: "Ma maman est gentille." },
    { nl: "Ik heb een broer.", fr: "J'ai un frère." },
    { nl: "Dit is mijn oma.", fr: "Voici ma grand-mère." },
  ]
);

const lichaam = theme(
  "lichaam",
  "Het lichaam",
  "Le corps",
  "✋",
  "pink",
  [
    { nl: "oog", art: "het", fr: "l'œil", emoji: "👁️" },
    { nl: "neus", art: "de", fr: "le nez", emoji: "👃" },
    { nl: "mond", art: "de", fr: "la bouche", emoji: "👄" },
    { nl: "oor", art: "het", fr: "l'oreille", emoji: "👂" },
    { nl: "hand", art: "de", fr: "la main", emoji: "✋" },
    { nl: "voet", art: "de", fr: "le pied", emoji: "🦶" },
    { nl: "tand", art: "de", fr: "la dent", emoji: "🦷" },
    { nl: "been", art: "het", fr: "la jambe", emoji: "🦵" },
    { nl: "arm", art: "de", fr: "le bras", emoji: "💪" },
    { nl: "hart", art: "het", fr: "le cœur", emoji: "❤️" },
  ],
  [
    { nl: "Ik heb twee ogen.", fr: "J'ai deux yeux." },
    { nl: "Mijn hand is klein.", fr: "Ma main est petite." },
    { nl: "Mijn voet doet pijn.", fr: "Mon pied me fait mal." },
  ]
);

const huis = theme(
  "huis",
  "Het huis",
  "La maison",
  "🏠",
  "brown",
  [
    { nl: "huis", art: "het", fr: "la maison", emoji: "🏠" },
    { nl: "deur", art: "de", fr: "la porte", emoji: "🚪" },
    { nl: "raam", art: "het", fr: "la fenêtre", emoji: "🪟" },
    { nl: "bed", art: "het", fr: "le lit", emoji: "🛏️" },
    { nl: "stoel", art: "de", fr: "la chaise", emoji: "🪑" },
    { nl: "bank", art: "de", fr: "le canapé", emoji: "🛋️" },
    { nl: "tuin", art: "de", fr: "le jardin", emoji: "🌳" },
    { nl: "sleutel", art: "de", fr: "la clé", emoji: "🔑" },
    { nl: "lamp", art: "de", fr: "la lampe", emoji: "💡" },
    { nl: "klok", art: "de", fr: "l'horloge", emoji: "🕐" },
    { nl: "bad", art: "het", fr: "le bain", emoji: "🛁" },
  ],
  [
    { nl: "Ons huis is groot.", fr: "Notre maison est grande." },
    { nl: "De deur is open.", fr: "La porte est ouverte." },
    { nl: "Ik slaap in mijn bed.", fr: "Je dors dans mon lit." },
  ]
);

const school = theme(
  "school",
  "De school",
  "L'école",
  "🏫",
  "blue",
  [
    { nl: "school", art: "de", fr: "l'école", emoji: "🏫" },
    { nl: "boek", art: "het", fr: "le livre", emoji: "📖" },
    { nl: "pen", art: "de", fr: "le stylo", emoji: "🖊️" },
    { nl: "potlood", art: "het", fr: "le crayon", emoji: "✏️" },
    { nl: "tas", art: "de", fr: "le cartable", emoji: "🎒" },
    { nl: "schaar", art: "de", fr: "les ciseaux", emoji: "✂️" },
    { nl: "juf", art: "de", fr: "la maîtresse", emoji: "👩‍🏫" },
    { nl: "meester", art: "de", fr: "le maître", emoji: "👨‍🏫" },
    { nl: "papier", art: "het", fr: "le papier", emoji: "📄" },
    { nl: "bel", art: "de", fr: "la sonnette", emoji: "🔔" },
  ],
  [
    { nl: "Ik ga naar school.", fr: "Je vais à l'école." },
    { nl: "Dit is mijn boek.", fr: "Voici mon livre." },
    { nl: "De juf is aardig.", fr: "La maîtresse est gentille." },
  ]
);

const kleren = theme(
  "kleren",
  "De kleren",
  "Les vêtements",
  "👕",
  "purple",
  [
    { nl: "broek", art: "de", fr: "le pantalon", emoji: "👖" },
    { nl: "T-shirt", art: "het", fr: "le t-shirt", emoji: "👕" },
    { nl: "jas", art: "de", fr: "le manteau", emoji: "🧥" },
    { nl: "schoen", art: "de", fr: "la chaussure", emoji: "👟" },
    { nl: "sok", art: "de", fr: "la chaussette", emoji: "🧦" },
    { nl: "jurk", art: "de", fr: "la robe", emoji: "👗" },
    { nl: "hoed", art: "de", fr: "le chapeau", emoji: "🎩" },
    { nl: "bril", art: "de", fr: "les lunettes", emoji: "👓" },
    { nl: "handschoen", art: "de", fr: "le gant", emoji: "🧤" },
    { nl: "sjaal", art: "de", fr: "l'écharpe", emoji: "🧣" },
  ],
  [
    { nl: "Ik draag een broek.", fr: "Je porte un pantalon." },
    { nl: "Mijn jas is warm.", fr: "Mon manteau est chaud." },
    { nl: "Waar is mijn schoen?", fr: "Où est ma chaussure ?" },
  ]
);

const weer = theme(
  "weer",
  "Het weer",
  "Le temps qu'il fait",
  "☀️",
  "sky",
  [
    { nl: "zon", art: "de", fr: "le soleil", emoji: "☀️" },
    { nl: "regen", art: "de", fr: "la pluie", emoji: "🌧️" },
    { nl: "wolk", art: "de", fr: "le nuage", emoji: "☁️" },
    { nl: "sneeuw", art: "de", fr: "la neige", emoji: "❄️" },
    { nl: "wind", art: "de", fr: "le vent", emoji: "💨" },
    { nl: "regenboog", art: "de", fr: "l'arc-en-ciel", emoji: "🌈" },
    { nl: "onweer", art: "het", fr: "l'orage", emoji: "⛈️" },
    { nl: "maan", art: "de", fr: "la lune", emoji: "🌙" },
    { nl: "ster", art: "de", fr: "l'étoile", emoji: "⭐" },
    { nl: "paraplu", art: "de", fr: "le parapluie", emoji: "☂️" },
  ],
  [
    { nl: "De zon schijnt.", fr: "Le soleil brille." },
    { nl: "Het regent vandaag.", fr: "Il pleut aujourd'hui." },
    { nl: "Ik zie een regenboog.", fr: "Je vois un arc-en-ciel." },
  ]
);

const spelen = theme(
  "spelen",
  "Spelen en rijden",
  "Jouer et rouler",
  "⚽",
  "teal",
  [
    { nl: "bal", art: "de", fr: "le ballon", emoji: "⚽" },
    { nl: "fiets", art: "de", fr: "le vélo", emoji: "🚲" },
    { nl: "auto", art: "de", fr: "la voiture", emoji: "🚗" },
    { nl: "trein", art: "de", fr: "le train", emoji: "🚂" },
    { nl: "vliegtuig", art: "het", fr: "l'avion", emoji: "✈️" },
    { nl: "boot", art: "de", fr: "le bateau", emoji: "⛵" },
    { nl: "ballon", art: "de", fr: "le ballon gonflable", emoji: "🎈" },
    { nl: "step", art: "de", fr: "la trottinette", emoji: "🛴" },
    { nl: "spel", art: "het", fr: "le jeu", emoji: "🎲" },
    { nl: "pop", art: "de", fr: "la poupée", emoji: "🪆" },
  ],
  [
    { nl: "Ik speel met de bal.", fr: "Je joue avec le ballon." },
    { nl: "De auto is snel.", fr: "La voiture est rapide." },
    { nl: "Ik rijd met mijn fiets.", fr: "Je roule avec mon vélo." },
  ]
);

/**
 * L'ordre de cette liste est l'ordre d'affichage sur la page d'accueil.
 * Les thèmes les plus faciles d'abord.
 */
export const THEMES: Theme[] = [
  kleuren,
  getallen,
  dieren,
  eten,
  familie,
  lichaam,
  huis,
  school,
  kleren,
  weer,
  spelen,
];

export const ALL_WORDS: Word[] = THEMES.flatMap((t) => t.words);

export function getTheme(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
