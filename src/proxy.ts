import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // `leren` est exclu : l'application pour enfants n'a ni compte ni session,
  // elle doit fonctionner même sans configuration Supabase.
  matcher: [
    "/((?!leren|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
