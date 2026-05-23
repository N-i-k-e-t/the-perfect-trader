import type { ErrorEvent, EventHint } from '@sentry/nextjs';
import { getAppEnvironment } from '@/lib/environment';

export function getSentryDsn(): string | undefined {
    return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function isSentryEnabled(): boolean {
    return Boolean(getSentryDsn());
}

export function getSentryInitOptions() {
    const environment = getAppEnvironment();
    return {
        dsn: getSentryDsn(),
        environment,
        enabled: isSentryEnabled() && environment !== 'development',
        tracesSampleRate: environment === 'production' ? 0.1 : 0.2,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: environment === 'production' ? 0.1 : 0,
        sendDefaultPii: false,
        beforeSend(event: ErrorEvent, _hint: EventHint) {
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
            }
            return event;
        },
    };
}
