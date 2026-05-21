import LegalPageLayout, { LegalH2, LegalP, LegalUl } from '@/components/legal/LegalPageLayout';
import { APP_NAME } from '@/lib/brand';

export default function CookiesPage() {
    return (
        <LegalPageLayout title="Cookie Policy" lastUpdated="May 21, 2026">
            <LegalP>
                This policy explains how {APP_NAME} uses cookies and similar technologies on our website and web app.
            </LegalP>

            <LegalH2>What are cookies?</LegalH2>
            <LegalP>
                Cookies are small text files stored on your device. We use them to keep you signed in, remember
                preferences, and (with consent) measure usage.
            </LegalP>

            <LegalH2>Essential cookies</LegalH2>
            <LegalUl
                items={[
                    'Authentication session (Supabase) — required to log in and sync data.',
                    'Cookie consent preference — remembers your analytics choice.',
                    'Local storage for offline cache of your trader snapshot — core app function.',
                ]}
            />

            <LegalH2>Analytics cookies (optional)</LegalH2>
            <LegalP>
                If you click &quot;Accept all&quot; on our banner, we may enable analytics (e.g. PostHog) to understand
                feature usage. You can choose &quot;Essential only&quot; to decline non-essential tracking.
            </LegalP>

            <LegalH2>How to control cookies</LegalH2>
            <LegalUl
                items={[
                    'Use our cookie banner when you first visit.',
                    'Clear site data in your browser settings.',
                    'Block third-party cookies in browser privacy settings.',
                ]}
            />

            <LegalH2>Updates</LegalH2>
            <LegalP>We may update this policy; changes appear on this page with a new date.</LegalP>
        </LegalPageLayout>
    );
}
