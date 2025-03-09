import { auth } from "~/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const session = await auth();
    const pathname = request.nextUrl.pathname;

    if (["/", "/sign_in", "/api/auth"].includes(pathname)) {
        return NextResponse.next();
    }

    if (!session?.user) {
        const signInUrl = new URL("/sign_in", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         * - api/auth (auth endpoints)
         */
        "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
    ],
};