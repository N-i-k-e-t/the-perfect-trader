import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
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

export default nextConfig;
