import createMiddleware from "next-intl/middleware";
import { routing } from "@/shared/lib/i18n/routing";
import { auth0 } from "@/shared/api/auth0/auth0";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith("/auth")) {
        return await auth0.middleware(request)
    }

    const intlResponse = intlMiddleware(request)

    const authResponse = await auth0.middleware(request);
    for (const [key, value] of authResponse.headers) {
        if (key.toLowerCase() === 'x-middleware-next') {
            if (intlResponse.status >= 300) {
                continue;
            }
        }
        intlResponse.headers.set(key, value);
    }
    return intlResponse
}

export const config = {
    matcher: [
        "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
    ],
};