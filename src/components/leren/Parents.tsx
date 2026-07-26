"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2 } from "lucide-react";
import { THEMES } from "@/lib/leren/vocabulary";
import {
  emptyProgress,
  knownWordCount,
  MASTERED_BOX,
  themeStars,
  totalStars,
  wordState,
} from "@/lib/leren/progress";
import { updateProgress, useHydrated, useProgress } from "@/lib/leren/store";
import { hasDutchVoice, initSpeech, speak } from "@/lib/leren/speech";

/**
 * L'espace parents : réglages, suivi rapide, et la marche à suivre si le
 * son ne fonctionne pas. Volontairement écrit en français simple.
 */
export function ParentsPanel() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const [voiceOk, setVoiceOk] = useState<boolean | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    initSpeech();
  }, []);

  if (!hydrated) return <div className="p-8 text-center">Un instant…</div>;

  const mastered = THEMES.flatMap((t) => t.words).filter(
    (w) => wordState(progress, w.id).box >= MASTERED_BOX
  ).length;
  const totalWords = THEMES.reduce((n, t) => n + t.words.length, 0);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
      <Link
        href="/leren"
        className="mb-6 inline-flex items-center gap-2 text-base font-bold"
        style={{ color: "var(--leren-ink-soft)" }}
      >
        <ArrowLeft size={20} aria-hidden /> Retour au jeu
      </Link>

      <h1 className="text-3xl font-extrabold">Espace parents</h1>

      <Section title="Où en est l'enfant ?">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Box value={`${mastered}/${totalWords}`} label="mots acquis" />
          <Box value={knownWordCount(progress)} label="mots rencontrés" />
          <Box value={`${totalStars(progress, THEMES)}/${THEMES.length * 3}`} label="étoiles" />
        </div>
        <ul className="mt-4 flex flex-col gap-1">
          {THEMES.map((theme) => {
            const acquired = theme.words.filter(
              (w) => wordState(progress, w.id).box >= MASTERED_BOX
            ).length;
            return (
              <li key={theme.id} className="flex items-center justify-between py-1 text-base">
                <span>
                  {theme.emoji} {theme.fr}
                </span>
                <span style={{ color: "var(--leren-ink-soft)" }}>
                  {acquired}/{theme.words.length} mots · {themeStars(progress, theme)} ⭐
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Réglages">
        <label className="block text-base font-bold" htmlFor="child-name">
          Prénom de l&apos;enfant
        </label>
        <input
          id="child-name"
          type="text"
          value={progress.name}
          maxLength={20}
          placeholder="Par exemple : Lina"
          onChange={(e) => updateProgress({ ...progress, name: e.target.value })}
          className="mt-1 w-full rounded-xl border-2 px-4 py-3 text-lg"
          style={{ borderColor: "var(--leren-line)", background: "#fff" }}
        />

        <p className="mt-5 text-base font-bold">L&apos;enfant sait-il lire ?</p>
        <p className="text-sm" style={{ color: "var(--leren-ink-soft)" }}>
          Si non, les exercices écrits sont remplacés par des exercices
          d&apos;écoute et d&apos;images.
        </p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            className="leren-choice flex-1 px-4 py-3"
            style={progress.reader ? { borderColor: "var(--leren-accent)" } : undefined}
            onClick={() => updateProgress({ ...progress, reader: true })}
          >
            Oui, il/elle lit
          </button>
          <button
            type="button"
            className="leren-choice flex-1 px-4 py-3"
            style={!progress.reader ? { borderColor: "var(--leren-accent)" } : undefined}
            onClick={() => updateProgress({ ...progress, reader: false })}
          >
            Pas encore
          </button>
        </div>
      </Section>

      <Section title="Le son">
        <p className="text-base">
          L&apos;application utilise la voix néerlandaise installée sur
          l&apos;appareil. Touchez le bouton pour vérifier&nbsp;: vous devez
          entendre «&nbsp;<em>de hond</em>&nbsp;» prononcé en néerlandais.
        </p>
        <button
          type="button"
          className="leren-primary mt-4"
          onClick={() => {
            speak("de hond");
            setVoiceOk(hasDutchVoice());
          }}
        >
          <Volume2 size={22} aria-hidden /> Tester le son
        </button>
        {voiceOk === false && (
          <p
            className="mt-4 rounded-xl border-2 p-3 text-base"
            style={{ borderColor: "var(--leren-bad)", background: "var(--leren-bad-soft)" }}
          >
            Aucune voix néerlandaise n&apos;a été trouvée sur cet appareil. Le
            mot sera lu avec l&apos;accent de la langue par défaut, ce qui
            n&apos;est pas idéal pour apprendre. Pour l&apos;ajouter&nbsp;:
            <br />
            <strong>Android</strong> : Réglages → Général → Synthèse vocale →
            installer les données vocales → Nederlands.
            <br />
            <strong>iPhone / iPad</strong> : Réglages → Accessibilité → Contenu
            énoncé → Voix → Néerlandais.
            <br />
            <strong>Windows</strong> : Paramètres → Heure et langue → Langue →
            ajouter «&nbsp;Nederlands&nbsp;».
            <br />
            <strong>Mac</strong> : Réglages → Accessibilité → Contenu énoncé →
            Voix système → Personnaliser → Néerlandais.
          </p>
        )}
        {voiceOk === true && (
          <p className="mt-3 text-base" style={{ color: "var(--leren-good)" }}>
            Une voix néerlandaise est bien installée sur cet appareil.
          </p>
        )}
      </Section>

      <Section title="Comment ça marche">
        <p className="text-base">
          Chaque mot est rangé dans une «&nbsp;boîte&nbsp;», de 0 à 5. Une bonne
          réponse le fait monter d&apos;une boîte, une erreur le fait
          redescendre. Plus la boîte est haute, plus le mot met de temps à
          revenir&nbsp;: 1&nbsp;jour, 2&nbsp;jours, 4, 8, puis 3&nbsp;semaines.
          L&apos;enfant révise donc surtout ce qu&apos;il ne sait pas encore.
        </p>
        <p className="mt-3 text-base">
          Une leçon dure environ 5&nbsp;minutes et travaille 8&nbsp;mots, dont
          4&nbsp;nouveaux au maximum. Un mot raté revient tout de suite après,
          sous une forme plus facile&nbsp;: l&apos;enfant ne termine jamais sur
          un échec.
        </p>
        <p className="mt-3 text-base">
          Une régularité de 5&nbsp;minutes par jour vaut bien mieux
          qu&apos;une heure le dimanche. C&apos;est à ça que sert la petite
          flamme 🔥 sur la page d&apos;accueil.
        </p>
      </Section>

      <Section title="Vos données">
        <p className="text-base">
          Rien ne quitte cet appareil. La progression est enregistrée dans le
          navigateur&nbsp;: il n&apos;y a ni compte, ni mot de passe, ni
          serveur. En contrepartie, la progression ne suit pas d&apos;un
          appareil à l&apos;autre, et effacer l&apos;historique du navigateur
          l&apos;efface aussi.
        </p>
        {!confirmReset ? (
          <button
            type="button"
            className="leren-choice mt-4 px-5 py-3"
            onClick={() => setConfirmReset(true)}
          >
            Tout recommencer à zéro
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="leren-choice px-5 py-3"
              style={{ borderColor: "var(--leren-bad)", color: "var(--leren-bad)" }}
              onClick={() => {
                updateProgress(emptyProgress());
                setConfirmReset(false);
              }}
            >
              Oui, tout effacer
            </button>
            <button
              type="button"
              className="leren-choice px-5 py-3"
              onClick={() => setConfirmReset(false)}
            >
              Annuler
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="mt-6 rounded-2xl border-2 p-5"
      style={{ borderColor: "var(--leren-line)", background: "var(--leren-card)" }}
    >
      <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Box({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border-2 p-3" style={{ borderColor: "var(--leren-line)" }}>
      <p className="text-2xl font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-xs font-semibold" style={{ color: "var(--leren-ink-soft)" }}>
        {label}
      </p>
    </div>
  );
}
