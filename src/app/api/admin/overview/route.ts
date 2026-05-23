import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient, isFounderAdminEmail } from '@/lib/supabase-admin';
import { isSupabaseConfigured } from '@/lib/supabase-data';

export async function GET() {
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

    const admin = createAdminClient();

    const [capacityRes, waitlistRes, snapshotsRes, eventsRes, adoptionRes] = await Promise.all([
        supabase.rpc('get_beta_capacity'),
        admin.from('beta_waitlist').select('id', { count: 'exact', head: true }),
        admin.from('trader_snapshots').select('user_id, updated_at'),
        admin
            .from('user_events')
            .select('event_name, event_category, page_path, timestamp_utc, user_id')
            .order('timestamp_utc', { ascending: false })
            .limit(20),
        admin.from('user_events').select('event_name, user_id').limit(5000),
    ]);

    const capacity = capacityRes.data as Record<string, unknown> | null;
    const snapshotRows = snapshotsRes.data ?? [];
    const uniqueUsers = new Set(snapshotRows.map((r) => r.user_id).filter(Boolean));

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const activeToday = snapshotRows.filter((r) => r.updated_at?.startsWith(today)).length;
    const activeWeek = snapshotRows.filter((r) => r.updated_at && r.updated_at >= weekAgo).length;

    const adoptionMap = new Map<string, Set<string>>();
    for (const row of adoptionRes.data ?? []) {
        if (!row.event_name || !row.user_id) continue;
        if (!adoptionMap.has(row.event_name)) adoptionMap.set(row.event_name, new Set());
        adoptionMap.get(row.event_name)!.add(row.user_id);
    }
    const featureAdoption = [...adoptionMap.entries()]
        .map(([event_name, users]) => ({ event_name, unique_users: users.size }))
        .sort((a, b) => b.unique_users - a.unique_users)
        .slice(0, 12);

    const eventsToday =
        eventsRes.data?.filter((e) => e.timestamp_utc?.startsWith(today)).length ?? 0;

    return NextResponse.json({
        metrics: {
            total_users: uniqueUsers.size,
            dau: activeToday,
            wau: activeWeek,
            beta_current: Number(capacity?.current) || 0,
            beta_max: Number(capacity?.max) || 10,
            waitlist_count: waitlistRes.count ?? 0,
            events_today: eventsToday,
        },
        recent_events: eventsRes.data ?? [],
        feature_adoption: featureAdoption,
    });
}
