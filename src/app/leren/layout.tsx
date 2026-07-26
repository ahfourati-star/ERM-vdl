import type { Metadata } from "next";
import "./leren.css";

export const metadata: Metadata = {
  title: "Nederlands leren — apprendre le néerlandais",
  description:
    "Un petit jeu pour apprendre le néerlandais aux enfants francophones : images, sons et répétition.",
};

/**
 * Ce layout enveloppe toute la section /leren. Il applique la classe
 * `.leren`, qui contient les couleurs et les styles réservés aux enfants :
 * le reste du site n'est pas touché.
 */
export default function LerenLayout({ children }: { children: React.ReactNode }) {
  return <div className="leren">{children}</div>;
}
