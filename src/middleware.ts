import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées (app privée)
  const isProtected =
    pathname.startsWith("/discover") ||
    pathname.startsWith("/flares") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/vault") ||
    pathname.startsWith("/settings");

  if (isProtected) {
    // TODO: vérifier session Supabase
    // Pour l'instant on laisse passer (auth pas encore branchée)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
