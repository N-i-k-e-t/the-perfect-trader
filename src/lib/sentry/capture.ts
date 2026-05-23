import * as Sentry from '@sentry/nextjs';
import { isSentryEnabled } from '@/lib/sentry/options';

export function captureClientException(
    error: unknown,
    context?: Record<string, unknown>
): void {
    if (!isSentryEnabled()) return;
    Sentry.withScope((scope) => {
        if (context) scope.setContext('client', context);
        Sentry.captureException(error);
    });
}

export function captureClientMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'error',
    context?: Record<string, unknown>
): void {
    if (!isSentryEnabled()) return;
    Sentry.withScope((scope) => {
        if (context) scope.setContext('client', context);
        Sentry.captureMessage(message, level);
    });
}
