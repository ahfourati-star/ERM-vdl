import { redirect } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createInvitation } from "@/app/actions/invite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { membership } = await requireMembership();
  if (membership.role !== "ADMIN") redirect("/dashboard");

  const { error } = await searchParams;
  const invitations = await prisma.invitation.findMany({
    where: { orgId: membership.orgId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inviter un collègue</h1>
        <p className="text-muted-foreground">
          Entrez son email, puis envoyez-lui vous-même le lien généré ci-dessous (par email,
          message...).
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Nouvelle invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInvitation} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email du collègue</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit">Inviter</Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations en attente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invite) => (
              <div key={invite.id} className="rounded border p-3 text-sm">
                <p className="font-medium">{invite.email}</p>
                <p className="break-all text-muted-foreground">
                  {siteUrl}/invite/{invite.token}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
