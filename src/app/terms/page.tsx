import LegalPageLayout, { LegalH2, LegalP, LegalUl } from '@/components/legal/LegalPageLayout';
import { IS_BETA, LEGAL_ENTITY } from '@/lib/config';
import { APP_NAME } from '@/lib/brand';

export default function TermsPage() {
    return (
        <LegalPageLayout title="Terms of Service" lastUpdated="May 21, 2026">
            <LegalP>
                These Terms govern your use of {APP_NAME}, operated by {LEGAL_ENTITY}. If you do not agree, do not
                use the Service.
            </LegalP>

            <LegalH2>1. The Service</LegalH2>
            <LegalP>
                {APP_NAME} is a psychology-first trading discipline tool: rules, mood tracking, journaling, and
                behavioral analytics. We do not execute trades, provide signals, or manage your capital.
            </LegalP>

            <LegalH2>2. Not financial advice</LegalH2>
            <LegalP>
                <strong>We are not financial advisors.</strong> Nothing in the app is investment, tax, or legal
                advice. You are solely responsible for trading decisions and outcomes. Past discipline scores do not
                guarantee future results.
            </LegalP>

            {IS_BETA && (
                <>
                    <LegalH2>3. Beta program</LegalH2>
                    <LegalP>
                        The Service is in <strong>beta</strong>. Features may change, break, or be removed. We may
                        migrate data with notice. During beta, paid subscriptions may not be active — access is
                        provided free unless we announce otherwise.
                    </LegalP>
                </>
            )}

            <LegalH2>4. Accounts</LegalH2>
            <LegalP>
                You must provide accurate registration information and keep credentials secure. You are responsible
                for activity under your account.
            </LegalP>

            <LegalH2>5. Acceptable use</LegalH2>
            <LegalUl
                items={[
                    'No illegal activity, harassment, or attempts to breach security.',
                    'No scraping or automated abuse of the API.',
                    `No misrepresentation of affiliation with ${APP_NAME}.`,
                ]}
            />

            <LegalH2>6. Subscriptions (when available)</LegalH2>
            <LegalP>
                Paid plans will be billed in advance on a recurring basis (monthly or annual) via Stripe on web or
                app-store billing on mobile when launched. See our Refund Policy. You may cancel before renewal.
            </LegalP>

            <LegalH2>7. Intellectual property</LegalH2>
            <LegalP>
                We own the app, brand, and UI. You own your trading content. You grant us a license to host and
                process your content solely to operate the Service.
            </LegalP>

            <LegalH2>8. Limitation of liability</LegalH2>
            <LegalP>
                To the maximum extent permitted by law, we are not liable for trading losses, indirect damages, or
                downtime. Our total liability is limited to fees you paid us in the prior 12 months (or zero during
                free beta).
            </LegalP>

            <LegalH2>9. Termination</LegalH2>
            <LegalP>
                You may stop using the Service anytime. We may suspend accounts that violate these Terms.
            </LegalP>

            <LegalH2>10. Governing law</LegalH2>
            <LegalP>
                These Terms are governed by the laws of India unless otherwise required by your jurisdiction. Disputes
                should first be raised via support.
            </LegalP>
        </LegalPageLayout>
    );
}
