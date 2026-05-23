import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { isSupabaseConfigured } from '@/lib/supabase-data';
import { checkRateLimit } from '@/lib/rate-limit';

function clientIp(req: Request): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'
    );
}

export async function POST(req: Request) {
    const ip = clientIp(req);
    const limited = checkRateLimit(`changelog:${ip}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let body: { email?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: 'not_configured' }, { status: 503 });
    }

    try {
        const admin = createAdminClient();
        const { error } = await admin.from('changelog_subscribers').upsert(
            { email },
            { onConflict: 'email', ignoreDuplicates: true }
        );
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Server error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
