import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase-data';

/** Beacon / keepalive flush for analytics events. */
export async function POST(req: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
    }

    let body: { events?: unknown[] };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const events = body.events;
    if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json({ error: 'empty' }, { status: 400 });
    }

    if (events.length > 100) {
        return NextResponse.json({ error: 'too_many' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const rows = events.map((row) => {
        const r = row as Record<string, unknown>;
        if (user?.id) {
            return { ...r, user_id: user.id };
        }
        return { ...r, user_id: null };
    });

    const { error } = await supabase.from('user_events').insert(rows);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
}
