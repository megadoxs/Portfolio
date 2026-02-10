import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    output: 'standalone',
    serverExternalPackages: ['@prisma/client', 'prisma']
};

const withNextIntl = createNextIntlPlugin("./src/shared/lib/i18n/request.ts");

export default withNextIntl(nextConfig);