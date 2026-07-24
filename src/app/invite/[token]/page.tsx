import { prisma } from "@/lib/db";
import { acceptInvitation } from "@/app/actions/invite";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function AcceptInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Invitation invalide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ce lien d&apos;invitation est invalide ou a expiré.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const acceptWithToken = acceptInvitation.bind(null, token);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Rejoindre {invitation.organization.name}</CardTitle>
          <CardDescription>
            Choisissez un mot de passe pour activer votre compte ({invitation.email}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={acceptWithToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Rejoindre l&apos;entreprise
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
