import Link from 'next/link';
import MarketingDocLayout from '@/components/marketing/MarketingDocLayout';
import ContactForm from '@/components/marketing/ContactForm';
import { SUPPORT_EMAIL } from '@/lib/config';
import { BookOpen, AlertCircle, Mail } from 'lucide-react';

const QUICK_START = [
    'Sign up (Google is fastest)',
    'Complete the 2-minute onboarding quiz',
    'Add your 3 most important rules',
    'Do your pre-session check on Today',
    'Log every trade — win or loss',
    'Check your rules after each trade',
    'Read your weekly grade in Stats',
];

const ISSUES = [
    {
        title: "I can't log in",
        fix: 'Try Google sign-in, clear app cache in Settings, or confirm your invite email matches signup.',
    },
    {
        title: "My data didn't save",
        fix: 'Check internet connection, then pull-to-refresh on Today or Journal.',
    },
    {
        title: "AI parse isn't working",
        fix: 'Feature is in beta — use manual trade entry; AI requires GEMINI_API_KEY on the server.',
    },
    {
        title: 'I lost my data',
        fix: 'Open Settings and confirm you are signed in with the same email. Data is cloud-synced per account.',
    },
];

export default function HelpPage() {
    return (
        <MarketingDocLayout title="Help & Support" subtitle="Quick answers and direct contact.">
            <section>
                <h2 className="flex items-center gap-2 text-[20px] font-black text-white mb-4">
                    <BookOpen size={22} className="text-emerald-400" />
                    Quick start
                </h2>
                <ol className="list-decimal pl-5 space-y-2 text-white/75">
                    {QUICK_START.map((step, i) => (
                        <li key={step}>
                            <span className="font-bold text-white/90">{i + 1}.</span> {step}
                        </li>
                    ))}
                </ol>
            </section>

            <section>
                <h2 className="flex items-center gap-2 text-[20px] font-black text-white mb-4">
                    <AlertCircle size={22} className="text-emerald-400" />
                    Common issues
                </h2>
                <div className="flex flex-col gap-4">
                    {ISSUES.map((item) => (
                        <div key={item.title} className="rounded-xl border border-white/10 p-4 bg-white/5">
                            <p className="font-black text-white text-[15px]">{item.title}</p>
                            <p className="text-white/65 text-[14px] mt-1">{item.fix}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="flex items-center gap-2 text-[20px] font-black text-white mb-2">
                    <Mail size={22} className="text-emerald-400" />
                    Contact
                </h2>
                <p className="text-white/65 mb-1">Can&apos;t find what you need?</p>
                <p className="text-white/65 mb-1">
                    Email:{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-400 font-bold hover:underline">
                        {SUPPORT_EMAIL}
                    </a>
                </p>
                <p className="text-white/50 text-[14px] mb-4">Response within 24 hours (usually faster).</p>
                <ContactForm compact />
                <p className="mt-4 text-[13px] text-white/40">
                    Or use the{' '}
                    <Link href="/contact" className="text-emerald-400 hover:underline">
                        full contact page
                    </Link>
                    .
                </p>
            </section>
        </MarketingDocLayout>
    );
}
