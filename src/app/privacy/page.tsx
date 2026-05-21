import LegalPageLayout, { LegalH2, LegalP, LegalUl } from '@/components/legal/LegalPageLayout';
import { LEGAL_ENTITY, PRIVACY_EMAIL, SUPABASE_REGION_LABEL } from '@/lib/config';
import { APP_NAME } from '@/lib/brand';

export default function PrivacyPage() {
    return (
        <LegalPageLayout title="Privacy Policy" lastUpdated="May 21, 2026">
            <LegalP>
                {LEGAL_ENTITY} operates {APP_NAME} (&quot;we&quot;, &quot;us&quot;, &quot;the Service&quot;). This policy
                explains what we collect, why, and your rights. By using the Service you agree to this policy.
            </LegalP>

            <LegalH2>1. What data we collect</LegalH2>
            <LegalUl
                items={[
                    'Account: email, display name, authentication identifiers (passwords are hashed by Supabase Auth — we never store plain text passwords).',
                    'Work data: trades, rules, session state, daily discipline logs, analytics aggregates.',
                    'Thoughts data: diary scan metadata, observations, pre/post-session notes, AI coaching memory (user model).',
                    'Usage: app opens, feature usage (if you accept analytics cookies).',
                    'Device: browser type, approximate region from IP (standard web logs via hosting).',
                    'Optional uploads: trade chart images or journal scans when you use capture features.',
                ]}
            />

            <LegalH2>2. Why we collect it</LegalH2>
            <LegalUl
                items={[
                    'Provide the trading discipline journal and sync across devices.',
                    'Calculate compliance grades, streaks, and performance views.',
                    'Deliver optional AI coaching and diary parsing when you trigger those features.',
                    'Improve reliability and security of the Service.',
                    'Send product emails only with your consent.',
                ]}
            />

            <LegalH2>3. How we store it</LegalH2>
            <LegalP>
                Data is stored in Supabase (PostgreSQL on AWS infrastructure), region {SUPABASE_REGION_LABEL}.
                Each user&apos;s data is isolated with Row Level Security — you can only access your own rows.
                Data in transit uses TLS. Passwords are managed by Supabase Auth (bcrypt). Diary images may use
                Supabase Storage when that feature is enabled.
            </LegalP>
            <LegalP>
                We logically separate <strong>app</strong> (account/settings), <strong>work</strong> (trades, rules,
                grades), and <strong>thoughts</strong> (journal psychology, diary, AI memory) in our data model.
            </LegalP>

            <LegalH2>4. Who we share it with</LegalH2>
            <LegalUl
                items={[
                    'We do not sell your personal data.',
                    'Supabase — hosting, authentication, database (processor).',
                    'Vercel — application hosting (processor).',
                    'Google (Gemini) — only when you use AI parse/scan features; limited to content you submit.',
                    'Analytics (e.g. PostHog) — only if you accept analytics cookies; anonymized usage where possible.',
                    'Legal authorities — only if required by valid law and proper process.',
                ]}
            />

            <LegalH2>5. Your rights</LegalH2>
            <LegalUl
                items={[
                    'Access and export: download your data from Settings (JSON export).',
                    'Delete: log out and request account deletion via support; we delete cloud rows within 30 days.',
                    'Correction: edit profile and journal entries in the app.',
                    'Opt out: reject analytics cookies; disable optional AI features.',
                    'India (DPDP), EU (GDPR), California (CCPA): contact us to exercise rights — we respond within 72 hours.',
                ]}
            />

            <LegalH2>6. Retention</LegalH2>
            <LegalP>
                Active accounts: data retained while the account exists. Deleted accounts: primary data removed
                within 30 days; backups purged within 90 days where applicable.
            </LegalP>

            <LegalH2>7. Children</LegalH2>
            <LegalP>
                The Service is not intended for users under 18. We do not knowingly collect data from minors.
            </LegalP>

            <LegalH2>8. Security</LegalH2>
            <LegalUl
                items={[
                    'TLS for data in transit',
                    'Row Level Security on user tables',
                    'Hashed credentials via Supabase Auth',
                    'Session tokens with expiry',
                ]}
            />

            <LegalH2>9. Beta notice</LegalH2>
            <LegalP>
                The Service is in beta. Features and this policy may change. Material changes will be posted here
                with an updated date.
            </LegalP>

            <LegalH2>10. Contact</LegalH2>
            <LegalP>
                Privacy: <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#2563eb] font-bold">{PRIVACY_EMAIL}</a>
            </LegalP>
        </LegalPageLayout>
    );
}
