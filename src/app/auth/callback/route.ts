import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureBootstrapped } from "@/lib/org";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await ensureBootstrapped(data.user);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Lien de confirmation invalide ou expiré.")}`
  );
}
