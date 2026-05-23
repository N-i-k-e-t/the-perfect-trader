import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

function clientIp(req: Request): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'
    );
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
    const ip = clientIp(req);
    const limited = checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
    if (!limited.ok) {
        return NextResponse.json(
            { error: `Too many requests. Try again in ${limited.retryAfterSec}s.` },
            { status: 429 }
        );
    }

    let body: { name?: string; email?: string; message?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const message = body.message?.trim();

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email || !isValidEmail(email)) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!message || message.length < 10) {
        return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
        return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const to = process.env.BETA_REPORT_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@theperfecttrader.app';
    const from = process.env.RESEND_FROM ?? 'Perfect Trader <onboarding@resend.dev>';
    const preview = message.slice(0, 50).replace(/\n/g, ' ');
    const ist = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const text = `Contact form — The Perfect Trader

Name: ${name}
Email: ${email}
Time (IST): ${ist}

Message:
${message}`;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            reply_to: email,
            subject: `PT Contact: ${name} — ${preview}`,
            text,
        }),
    });

    if (!res.ok) {
        const errBody = await res.text();
        return NextResponse.json({ error: errBody.slice(0, 200) || 'Failed to send' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
}
