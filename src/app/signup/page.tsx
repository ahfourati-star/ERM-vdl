import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Créer votre entreprise</CardTitle>
          <CardDescription>
            Un compte = une entreprise. Vous serez administrateur de votre espace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nom de l&apos;entreprise</Label>
              <Input id="orgName" name="orgName" required placeholder="Ma Société" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Créer mon compte
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
