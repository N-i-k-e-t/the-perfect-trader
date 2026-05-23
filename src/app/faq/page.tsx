import MarketingDocLayout from '@/components/marketing/MarketingDocLayout';

const FAQ_ITEMS = [
    {
        q: 'Is this connected to my broker?',
        a: 'No. The Perfect Trader is not connected to any broker or trading platform. You log trades manually — this keeps it honest and forces conscious reflection.',
    },
    {
        q: 'Is my trading data secure?',
        a: 'Yes. All data is stored in Supabase with Row Level Security — only you can see your trades and rules. We never share your data with third parties.',
    },
    {
        q: 'What markets does it support?',
        a: "Any. It's designed for Indian equity, futures, options, forex, and crypto traders — but it works for any market. You define your own rules, so it's market-agnostic.",
    },
    {
        q: 'Is it free?',
        a: 'Yes, completely free during beta. When we launch paid plans (Pro at ₹499/month), beta users will get founding member pricing of ₹299/month locked in forever.',
    },
    {
        q: 'Will I lose my data if I clear my browser?',
        a: 'No. Everything is synced to the cloud via Supabase. Your data is safe across devices. (Tip: clear cache in Settings, not the browser directly.)',
    },
    {
        q: 'Can I export my trades?',
        a: "Yes. Settings → Export data gives you a full JSON export. CSV export is available from the Journal screen.",
    },
    {
        q: 'What is the AI coach?',
        a: 'The AI coach analyzes your trading patterns and gives contextual nudges — like a tilt warning after 2 consecutive rule breaks, or a pattern insight after a winning streak. It uses your actual data, not generic advice.',
    },
    {
        q: 'Is this financial advice?',
        a: "Absolutely not. Nothing in The Perfect Trader is financial advice. It's a discipline tracking tool. All trading decisions are yours.",
    },
];

export default function FaqPage() {
    return (
        <MarketingDocLayout title="FAQ" subtitle="Common questions from beta traders.">
            <div className="flex flex-col gap-3">
                {FAQ_ITEMS.map((item) => (
                    <details
                        key={item.q}
                        className="group rounded-xl border border-white/10 bg-white/5 open:bg-white/[0.07]"
                    >
                        <summary className="cursor-pointer list-none px-5 py-4 font-black text-[15px] text-white flex justify-between items-center gap-4">
                            {item.q}
                            <span className="text-emerald-400 text-[20px] group-open:rotate-45 shrink-0">
                                +
                            </span>
                        </summary>
                        <p className="px-5 pb-4 text-[14px] text-white/70 leading-relaxed">{item.a}</p>
                    </details>
                ))}
            </div>
        </MarketingDocLayout>
    );
}
