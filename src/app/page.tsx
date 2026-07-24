import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-3xl font-bold">Plateforme de gestion des risques</h1>
      <p className="max-w-md text-muted-foreground">
        Gérez, notez et suivez les risques de votre entreprise dans un espace privé et sécurisé.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className={buttonVariants()}>
          Créer mon entreprise
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Se connecter
        </Link>
      </div>
    </div>
  );
}
