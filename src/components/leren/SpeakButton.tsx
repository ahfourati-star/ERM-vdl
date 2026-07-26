"use client";

import { Volume2 } from "lucide-react";
import { speak } from "@/lib/leren/speech";

/**
 * Le bouton haut-parleur. Un appui = le mot est prononcé en néerlandais.
 * Un appui long (ou un deuxième appui rapide) le répète lentement.
 */
export function SpeakButton({
  text,
  size = "md",
  label,
}: {
  text: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const box = { sm: "h-12 w-12", md: "h-16 w-16", lg: "h-24 w-24" }[size];
  const icon = { sm: 20, md: 28, lg: 44 }[size];

  return (
    <button
      type="button"
      className={`leren-speaker ${box}`}
      aria-label={label ?? `Écouter « ${text} » en néerlandais`}
      onClick={() => speak(text)}
      onDoubleClick={() => speak(text, { slow: true })}
    >
      <Volume2 size={icon} strokeWidth={2.5} aria-hidden />
    </button>
  );
}
