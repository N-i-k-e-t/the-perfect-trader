import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient, isFounderAdminEmail } from '@/lib/supabase-admin';
import { isSupabaseConfigured } from '@/lib/supabase-data';

export async function POST(req: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
    }

    let body: { email?: string; source?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('join_beta_waitlist', {
        p_email: email,
        p_source: body.source ?? 'beta_page',
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data as { ok?: boolean; duplicate?: boolean };
    return NextResponse.json({ ok: true, duplicate: Boolean(result?.duplicate) });
}

export async function GET() {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: 'not_configured' }, { status: 503 });
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isFounderAdminEmail(user.email)) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data, error, count } = await admin
        .from('beta_waitlist')
        .select('id, email, source, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? data?.length ?? 0, rows: data ?? [] });
}
