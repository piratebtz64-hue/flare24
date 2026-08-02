import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // recovery | signup | magiclink | ...
  const nextParam = searchParams.get("next");

  // Password recovery must land on update-password, never home/discover
  const next =
    nextParam ||
    (type === "recovery" ? "/auth/update-password" : "/discover");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=auth&reason=${encodeURIComponent(error.message)}`
    );
  }

  // No code: still send recovery intent to the form (hash tokens handled client-side)
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/auth/update-password`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
