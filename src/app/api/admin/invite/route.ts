import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient, isFounderAdminEmail } from '@/lib/supabase-admin';
import { isSupabaseConfigured } from '@/lib/supabase-data';
import { SITE_URL } from '@/lib/config';

async function sendInviteEmail(to: string): Promise<{ ok: boolean; error?: string }> {
    const key = process.env.RESEND_API_KEY;
    if (!key) return { ok: false, error: 'RESEND_API_KEY not configured' };

    const from = process.env.RESEND_FROM ?? 'Perfect Trader <onboarding@resend.dev>';
    const signupUrl = `${SITE_URL}/signup`;
    const text = `Hey trader,

Your beta spot is confirmed.

Sign up here: ${signupUrl}

Takes 2 minutes to set up. Log your first trade today.

— Niket`;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject: "You're in — The Perfect Trader beta is ready for you",
            text,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: body.slice(0, 200) };
    }
    return { ok: true };
}

export async function POST(req: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: 'not_configured' }, { status: 503 });
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email || !isFounderAdminEmail(user.email)) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    let body: { email?: string; user_id?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    const sent = await sendInviteEmail(email);
    if (!sent.ok) {
        return NextResponse.json({ error: sent.error ?? 'email_failed' }, { status: 502 });
    }

    const admin = createAdminClient();
    const { error } = await admin
        .from('beta_waitlist')
        .update({ invited_at: new Date().toISOString() })
        .eq('email', email);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
