import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

export default function LegalPageLayout({
    title,
    lastUpdated,
    children,
}: {
    title: string;
    lastUpdated: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-[100dvh] bg-white text-[#1a1a2e]">
            <div className="max-w-[720px] mx-auto px-6 py-12 md:py-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#1a1a2e] mb-10 font-bold text-[14px]"
                >
                    <ArrowLeft size={18} />
                    Back to home
                </Link>
                <h1 className="text-[28px] md:text-[40px] font-black mb-2 tracking-tight">{title}</h1>
                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-10">
                    Last updated: {lastUpdated}
                </p>
                <article className="legal-prose flex flex-col gap-5 text-[15px] leading-relaxed text-[#4b5563]">
                    {children}
                </article>
                <footer className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-[12px] font-bold uppercase tracking-wider text-gray-400">
                    <Link href="/privacy" className="hover:text-[#1a1a2e]">Privacy</Link>
                    <Link href="/terms" className="hover:text-[#1a1a2e]">Terms</Link>
                    <Link href="/cookies" className="hover:text-[#1a1a2e]">Cookies</Link>
                    <Link href="/refund" className="hover:text-[#1a1a2e]">Refunds</Link>
                    <Link href="/contact" className="hover:text-[#1a1a2e]">Contact</Link>
                </footer>
            </div>
        </div>
    );
}

export function LegalH2({ children }: { children: ReactNode }) {
    return <h2 className="text-xl font-black text-[#1a1a2e] mt-6">{children}</h2>;
}

export function LegalP({ children }: { children: ReactNode }) {
    return <p>{children}</p>;
}

export function LegalUl({ items }: { items: string[] }) {
    return (
        <ul className="list-disc pl-6 flex flex-col gap-2">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}
