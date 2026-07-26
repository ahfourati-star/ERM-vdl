/**
 * LA VOIX NÉERLANDAISE.
 *
 * Le néerlandais a des sons ("ui", "eu", "g", "ij") qu'un enfant francophone
 * ne peut pas deviner à l'écrit. Entendre chaque mot n'est donc pas un
 * bonus : c'est le cœur de l'apprentissage.
 *
 * On utilise la synthèse vocale intégrée au navigateur. C'est gratuit,
 * immédiat, et ça marche hors ligne une fois la voix installée.
 */

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesRequested = false;

function pickDutchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // On préfère le néerlandais des Pays-Bas (nl-NL), puis celui de Belgique
  // (nl-BE), puis n'importe quelle voix néerlandaise.
  return (
    voices.find((v) => v.lang === "nl-NL") ??
    voices.find((v) => v.lang === "nl-BE") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("nl")) ??
    null
  );
}

/**
 * Les voix se chargent de façon asynchrone dans certains navigateurs.
 * On s'abonne une seule fois à l'événement pour rafraîchir notre choix.
 */
export function initSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (voicesRequested) return;
  voicesRequested = true;

  cachedVoice = pickDutchVoice();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    cachedVoice = pickDutchVoice();
  });
}

/** Une vraie voix néerlandaise est-elle disponible sur cet appareil ? */
export function hasDutchVoice(): boolean {
  if (!cachedVoice) cachedVoice = pickDutchVoice();
  return cachedVoice !== null;
}

/**
 * Prononce un mot ou une phrase en néerlandais.
 * `slow` sert au bouton "réécouter lentement".
 */
export function speak(text: string, options: { slow?: boolean } = {}): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // On coupe ce qui est peut-être encore en train d'être dit : un enfant
  // qui appuie trois fois d'affilée ne doit pas déclencher une file d'attente.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (!cachedVoice) cachedVoice = pickDutchVoice();
  if (cachedVoice) utterance.voice = cachedVoice;
  utterance.lang = cachedVoice?.lang ?? "nl-NL";
  // Un peu plus lent que la normale : c'est pour des enfants débutants.
  utterance.rate = options.slow ? 0.6 : 0.85;
  utterance.pitch = 1.05;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
