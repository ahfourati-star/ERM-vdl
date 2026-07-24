import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Vérifiez vos emails</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre
            compte et accéder à votre espace.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
