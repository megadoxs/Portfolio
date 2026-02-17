import createMiddleware from "next-intl/middleware";
import { routing } from "@/shared/lib/i18n/routing";
import { auth0 } from "@/shared/lib/auth0/auth0";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith("/auth")) {
        return await auth0.middleware(request)
    }

    const localePattern = new RegExp(`^/(${routing.locales.join('|')})/`);
    const pathWithoutLocale = request.nextUrl.pathname.replace(localePattern, '/');

    const localeMatch = request.nextUrl.pathname.match(localePattern);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    if (pathWithoutLocale.startsWith("/dashboard")) {
        const session = await auth0.getSession();

        if (!session) {
            const { pathname, search } = request.nextUrl;
            const returnTo = pathname + search;
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('returnTo', returnTo);
            loginUrl.searchParams.set('ui_locales', locale);
            return NextResponse.redirect(loginUrl);
        }
    }

    const intlResponse = intlMiddleware(request);
    const authResponse = await auth0.middleware(request);

    for (const [key, value] of authResponse.headers) {
        if (key.toLowerCase() === 'x-middleware-next') {
            if (intlResponse.status >= 300) {
                continue;
            }
        }
        intlResponse.headers.set(key, value);
    }

    return intlResponse;
}

export const config = {
    matcher: [
        "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
    ],
};