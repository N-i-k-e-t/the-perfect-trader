import Link from 'next/link';
import MarketingDocLayout from '@/components/marketing/MarketingDocLayout';
import { APP_NAME } from '@/lib/brand';
import { IS_BETA } from '@/lib/config';

export default function AboutPage() {
    return (
        <MarketingDocLayout
            title="Built by a trader. For traders."
            subtitle="The Perfect Trader started as a personal obsession — why do I know the rules but keep breaking them?"
        >
            <section>
                <h2 className="text-[20px] font-black text-white mb-3">The problem</h2>
                <p>
                    Most trading journals track P&amp;L, not discipline. They celebrate wins and hide the pattern behind
                    losses. The real cost of a bad day isn&apos;t always the money — it&apos;s breaking the same rule
                    again, trading when you said you wouldn&apos;t, and waking up tomorrow with less trust in yourself.
                </p>
                <p className="mt-4">
                    I built this because I needed something that held me accountable before the market opened — not
                    after I&apos;d already revenge-traded.
                </p>
            </section>

            <section>
                <h2 className="text-[20px] font-black text-white mb-3">The solution</h2>
                <p>
                    {APP_NAME} is a daily discipline OS: rules you set, trades you log, grades you earn. Pre-session
                    checks lock your plan. Post-trade reflection catches tilt early. AI coaching reads your actual
                    patterns — not generic motivational quotes.
                </p>
            </section>

            <section>
                <h2 className="text-[20px] font-black text-white mb-3">About Niket</h2>
                <p>
                    I&apos;m Niket — a trader from Nagpur, India, building this solo. Every piece of feedback goes
                    directly to me. No support queue, no corporate layer. I use this app every session myself; if it
                    doesn&apos;t help my discipline, it doesn&apos;t ship.
                </p>
            </section>

            {IS_BETA && (
                <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                    <p className="text-white font-bold mb-4">
                        We&apos;re in beta — a small group of traders with a direct feedback loop. Spots are limited.
                    </p>
                    <Link
                        href="/beta"
                        className="inline-flex h-12 items-center px-6 rounded-xl bg-emerald-500 text-[#1a1a2e] font-black text-[15px] hover:bg-emerald-400"
                    >
                        Join Beta →
                    </Link>
                </section>
            )}
        </MarketingDocLayout>
    );
}
