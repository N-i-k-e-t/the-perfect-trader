import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SnapshotRow = { user_id: string; data: Record<string, unknown> };

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: snapshots, error: snapErr } = await supabase
        .from('trader_snapshots')
        .select('user_id, data');

    if (snapErr) {
        return new Response(JSON.stringify({ error: snapErr.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    let updated = 0;

    for (const row of (snapshots ?? []) as SnapshotRow[]) {
        const userId = row.user_id;
        const data = row.data ?? {};
        const userModel = (data.userModel ?? {}) as Record<string, unknown>;
        let changed = false;

        const { data: events } = await supabase
            .from('user_events')
            .select('event_name, event_properties, timestamp_utc')
            .eq('user_id', userId)
            .gte('timestamp_utc', thirtyDaysAgo);

        const list = events ?? [];
        const violations = list.filter((e) => e.event_name === 'rule_violated_flagged');
        const dismisses = list.filter(
            (e) =>
                e.event_name === 'coach_message_dismissed' &&
                e.timestamp_utc >= sevenDaysAgo
        );

        if (violations.length >= 3 && (userModel.tilt_threshold as number) > 1) {
            userModel.tilt_threshold = Math.max(1, ((userModel.tilt_threshold as number) ?? 2) - 1);
            changed = true;
        }

        if (dismisses.length >= 5 && userModel.responds_to !== 'data') {
            userModel.responds_to = 'data';
            changed = true;
        }

        const byRule: Record<string, number> = {};
        for (const v of violations) {
            const props = v.event_properties as Record<string, string> | null;
            const rid = props?.rule_id ?? 'unknown';
            byRule[rid] = (byRule[rid] ?? 0) + 1;
        }
        const topRule = Object.entries(byRule).sort((a, b) => b[1] - a[1])[0];
        if (topRule) {
            userModel.dominant_weakness = topRule[0];
            changed = true;
        }

        const sessionGrades = list.filter((e) => e.event_name === 'session_pre_plan_completed');
        if (sessionGrades.length >= 3) {
            userModel.best_time_window = 'morning';
            changed = true;
        }

        if (!changed) continue;

        userModel.model_updated_at = new Date().toISOString();
        const nextData = { ...data, userModel };
        const { error: upErr } = await supabase
            .from('trader_snapshots')
            .update({ data: nextData, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

        if (!upErr) updated += 1;
    }

    return new Response(JSON.stringify({ ok: true, users_updated: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
});
