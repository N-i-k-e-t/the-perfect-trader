import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';
import { ReactNode } from 'react';
import { APP_NAME } from '@/lib/brand';

export default function MarketingDocLayout({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-[100dvh] bg-[#1a1a2e] text-white">
            <header className="max-w-[680px] mx-auto px-6 py-8 flex items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white font-bold text-[14px] min-h-[44px]"
                >
                    <ArrowLeft size={18} />
                    Home
                </Link>
                <div className="w-9 h-9 bg-white text-[#1a1a2e] rounded-xl flex items-center justify-center">
                    <Target size={18} strokeWidth={3} />
                </div>
            </header>
            <main className="max-w-[680px] mx-auto px-6 pb-24">
                <h1 className="text-[36px] md:text-[44px] font-black tracking-tight mb-3 leading-tight">{title}</h1>
                {subtitle && (
                    <p className="text-[16px] font-bold text-white/60 mb-10 leading-relaxed">{subtitle}</p>
                )}
                <div className="prose-invert flex flex-col gap-6 text-[15px] font-medium text-white/75 leading-relaxed">
                    {children}
                </div>
            </main>
            <footer className="max-w-[680px] mx-auto px-6 pb-12 flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-widest text-white/30">
                <Link href="/privacy" className="hover:text-emerald-400">Privacy</Link>
                <Link href="/terms" className="hover:text-emerald-400">Terms</Link>
                <Link href="/faq" className="hover:text-emerald-400">FAQ</Link>
                <Link href="/help" className="hover:text-emerald-400">Help</Link>
                <Link href="/contact" className="hover:text-emerald-400">Contact</Link>
                <span className="text-white/20">© {APP_NAME}</span>
            </footer>
        </div>
    );
}
