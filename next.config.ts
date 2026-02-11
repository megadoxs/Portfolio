import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    output: 'standalone',
    serverExternalPackages: ['@prisma/client', 'prisma'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'skillicons.dev',
                pathname: '/icons/**',
            },
        ],
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

const withNextIntl = createNextIntlPlugin("./src/shared/lib/i18n/request.ts");

export default withNextIntl(nextConfig);