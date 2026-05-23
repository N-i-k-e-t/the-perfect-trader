'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body className="min-h-[100dvh] bg-[#1a1a2e] text-white flex flex-col items-center justify-center px-6">
                <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
                <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
                    The error was reported. Try again or return home.
                </p>
                <button
                    type="button"
                    onClick={() => reset()}
                    className="px-6 py-3 bg-white text-[#1a1a2e] rounded-full font-bold"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
