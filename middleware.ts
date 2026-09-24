import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refreshes the Supabase auth session on navigation so protected routes and
 * Server Components see a valid session. No-op when Supabase env vars are not
 * set, so the site runs locally before auth is configured.
 *
 * Phase 1 defines no protected routes; this simply keeps sessions fresh once
 * auth is added.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Not configured yet — pass through untouched.
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Touch the session to trigger a refresh when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protect the portal: unauthenticated users go to login.
  //
  // NOTE: this middleware only enforces AUTHENTICATION. It deliberately does
  // not attempt to decide partner AUTHORIZATION (approved / signed / paid /
  // active) — that is resolved against the database inside each Server
  // Component and API route via lib/reseller.ts#getPartnerAccess. Keeping the
  // gate next to the data, rather than in an edge redirect, is what guarantees
  // confidential pricing is never rendered for a non-active partner.
  if (path.startsWith("/portal") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Send them back where they were headed once they sign in.
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Signed-in users skip the auth screens.
  if ((path === "/login" || path === "/verify") && user) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = "/portal";
    portalUrl.search = "";
    return NextResponse.redirect(portalUrl);
  }

  return response;
}

export const config = {
  // Run on all routes except static assets, image optimization, and the Square
  // and Stripe webhooks. Webhooks must NOT pass through the Supabase session middleware:
  // they are server-to-server POSTs with no cookies, and the raw body must reach
  // the route handler byte-for-byte for HMAC signature verification.
  matcher: [
    "/((?!api/square/webhook|api/stripe/webhook|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
