import LegalPageLayout, { LegalH2, LegalP, LegalUl } from '@/components/legal/LegalPageLayout';
import Link from 'next/link';
import { IS_BETA, LEGAL_ENTITY, SUPPORT_EMAIL } from '@/lib/config';
import { APP_NAME } from '@/lib/brand';

export default function TermsPage() {
    return (
        <LegalPageLayout title="Terms of Service" lastUpdated="May 2026">
            <LegalH2>1. Acceptance of Terms</LegalH2>
            <LegalP>
                By using {APP_NAME}, operated by {LEGAL_ENTITY}, you agree to these Terms. If you do not agree, do not
                use the Service.
            </LegalP>

            <LegalH2>2. What The Perfect Trader is (and is not)</LegalH2>
            <LegalP>
                {APP_NAME} is a psychology-first trading discipline tool: rules, mood tracking, journaling, grades, and
                behavioral analytics. We do <strong>not</strong> execute trades, connect to brokers, provide signals, or
                manage your capital.
            </LegalP>

            <LegalH2>3. Beta disclaimer</LegalH2>
            <LegalP>
                {IS_BETA ? (
                    <>
                        The Service is in <strong>beta</strong>. Features may change, break, or be removed without
                        notice. We may end the beta program at any time. During beta, access is free unless we announce
                        otherwise.
                    </>
                ) : (
                    <>The Service may receive updates that change behavior or availability.</>
                )}
            </LegalP>

            <LegalH2>4. User account responsibilities</LegalH2>
            <LegalP>
                You must provide accurate registration information and keep your credentials secure. You are responsible
                for all activity under your account.
            </LegalP>

            <LegalH2>5. What data we collect</LegalH2>
            <LegalP>
                We collect account, trading discipline, and usage data as described in our{' '}
                <Link href="/privacy" className="text-emerald-600 font-bold underline">
                    Privacy Policy
                </Link>
                . Please read it for the full inventory.
            </LegalP>

            <LegalH2>6. User content</LegalH2>
            <LegalP>
                You own your trades, rules, notes, and journal entries. We do not claim ownership of your trading content.
            </LegalP>

            <LegalH2>7. How we use your data</LegalH2>
            <LegalUl
                items={[
                    'We host and process your content solely to operate and improve the Service.',
                    'We do not sell your personal trading data.',
                    'We may use aggregated, anonymized analytics to improve the product.',
                    'Service providers (e.g. hosting, email) process data under our instructions.',
                ]}
            />

            <LegalH2>8. No financial advice</LegalH2>
            <LegalP>
                <strong>Nothing in this app is financial, investment, tax, or legal advice.</strong> You are solely
                responsible for all trading decisions and outcomes. Past discipline scores do not guarantee future
                results.
            </LegalP>

            <LegalH2>9. Limitation of liability</LegalH2>
            <LegalP>
                To the maximum extent permitted by law, we are not liable for trading losses, indirect damages, or
                downtime. Our total liability is limited to fees you paid us in the prior 12 months (or zero during free
                beta).
            </LegalP>

            <LegalH2>10. Beta termination</LegalH2>
            <LegalP>
                We may suspend or end beta access at any time. We will try to give reasonable notice before major data
                migrations or shutdowns.
            </LegalP>

            <LegalH2>11. Changes to terms</LegalH2>
            <LegalP>
                We may update these Terms. Material changes will be reflected by updating the &quot;Last updated&quot;
                date. Continued use after changes means acceptance.
            </LegalP>

            <LegalH2>12. Contact</LegalH2>
            <LegalP>
                Questions:{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-600 font-bold underline">
                    {SUPPORT_EMAIL}
                </a>
            </LegalP>
        </LegalPageLayout>
    );
}
