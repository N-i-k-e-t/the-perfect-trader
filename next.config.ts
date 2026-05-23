import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Standalone breaks `next build` on GitHub Actions (Sentry node:inspector paths).
    // Vercel production builds use VERCEL=1 and keep standalone.
    ...(process.env.VERCEL || !process.env.GITHUB_ACTIONS ? { output: 'standalone' as const } : {}),
    async redirects() {
        return [
            {
                source: '/dashboard',
                destination: '/today',
                permanent: true,
            },
        ];
    },
};

export default withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI && !process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
});
