import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Mobile-safe recovery endpoint.
 * Email template should link to:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
 * Query params survive in-app browsers; hash fragments often do not.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "recovery" | "signup" | "magiclink" | "email" | "invite",
      token_hash,
    });

    if (!error) {
      const dest =
        type === "recovery"
          ? "/auth/update-password"
          : next || "/discover";
      return NextResponse.redirect(`${origin}${dest}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=auth&reason=${encodeURIComponent(error.message)}`
    );
  }

  // Fallback: PKCE code
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(
        `${origin}${next || "/auth/update-password"}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
