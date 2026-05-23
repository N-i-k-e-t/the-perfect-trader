import MarketingDocLayout from '@/components/marketing/MarketingDocLayout';
import { SUPPORT_EMAIL } from '@/lib/config';

export default function SecurityPage() {
    return (
        <MarketingDocLayout
            title="Security"
            subtitle="We take security seriously — especially for trading data."
        >
            <p>
                If you discover a vulnerability, please report it responsibly. We acknowledge reports within 48 hours
                and aim to fix confirmed issues within 14 days.
            </p>

            <section>
                <h2 className="text-[20px] font-black text-white mb-3">How to report</h2>
                <p>
                    Email{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-400 font-bold hover:underline">
                        {SUPPORT_EMAIL}
                    </a>{' '}
                    with steps to reproduce, impact, and any proof-of-concept. Do not publicly disclose until we
                    respond.
                </p>
            </section>

            <section>
                <h2 className="text-[20px] font-black text-white mb-3">What we do with reports</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Acknowledge within 48 hours</li>
                    <li>Investigate and patch confirmed issues</li>
                    <li>Notify you when fixed (if you want updates)</li>
                </ul>
            </section>

            <section>
                <h2 className="text-[20px] font-black text-white mb-3">Bug bounty</h2>
                <p>
                    There is no paid bug bounty during beta — we&apos;re an indie project. We will credit responsible
                    disclosures in our changelog when you agree.
                </p>
            </section>

            <p className="text-emerald-400/90 font-bold">
                Thank you for helping keep traders&apos; data safe.
            </p>
        </MarketingDocLayout>
    );
}
