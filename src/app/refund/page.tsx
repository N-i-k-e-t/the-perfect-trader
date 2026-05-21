import LegalPageLayout, { LegalH2, LegalP, LegalUl } from '@/components/legal/LegalPageLayout';
import { IS_BETA, SUPPORT_EMAIL } from '@/lib/config';
import { APP_NAME } from '@/lib/brand';

export default function RefundPage() {
    return (
        <LegalPageLayout title="Refund Policy" lastUpdated="May 21, 2026">
            {IS_BETA ? (
                <LegalP>
                    {APP_NAME} is in <strong>free beta</strong>. Paid subscriptions are not active yet. This policy
                    will apply when Pro plans launch via Stripe (web) or app stores (mobile).
                </LegalP>
            ) : null}

            <LegalH2>Subscriptions (when live)</LegalH2>
            <LegalUl
                items={[
                    'Monthly plans: cancel anytime; access continues until period end.',
                    'Annual plans: cancel anytime; no partial refunds except as below.',
                    'Web purchases (Stripe): managed in Settings → Subscription or Stripe customer portal.',
                    'Mobile purchases: managed in Apple App Store or Google Play subscription settings.',
                ]}
            />

            <LegalH2>14-day satisfaction (planned)</LegalH2>
            <LegalP>
                We intend to offer a 14-day money-back guarantee on first annual web purchase, requested within 14
                days of charge. Contact support with your account email.
            </LegalP>

            <LegalH2>Exceptions</LegalH2>
            <LegalUl
                items={[
                    'Refunds are not available for partial months already used.',
                    'App-store refunds follow Apple/Google policies.',
                    'Chargebacks without contacting support may result in account closure.',
                ]}
            />

            <LegalH2>Contact</LegalH2>
            <LegalP>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#2563eb] font-bold">{SUPPORT_EMAIL}</a>
            </LegalP>
        </LegalPageLayout>
    );
}
