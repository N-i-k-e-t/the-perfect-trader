import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendResend(to: string, subject: string, html: string): Promise<boolean> {
    const key = Deno.env.get('RESEND_API_KEY');
    if (!key || !to) return false;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: Deno.env.get('RESEND_FROM') ?? 'Perfect Trader <noreply@theperfecttrader.app>',
            to: [to],
            subject,
            html,
        }),
    });
    return res.ok;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const reportTo = Deno.env.get('BETA_REPORT_EMAIL') ?? Deno.env.get('NEXT_PUBLIC_SUPPORT_EMAIL');

    const { data: recentPlans } = await supabase
        .from('user_events')
        .select('user_id')
        .eq('event_name', 'session_pre_plan_completed')
        .gte('timestamp_utc', threeDaysAgo);

    const activeUserIds = new Set((recentPlans ?? []).map((r) => r.user_id).filter(Boolean));

    const { data: allUsers } = await supabase.from('trader_snapshots').select('user_id');

    const inactive = (allUsers ?? [])
        .map((r) => r.user_id as string)
        .filter((id) => id && !activeUserIds.has(id));

    let emailsSent = 0;
    for (const userId of inactive.slice(0, 50)) {
        const { data: streakEvents } = await supabase
            .from('user_events')
            .select('event_properties')
            .eq('user_id', userId)
            .eq('event_name', 'streak_milestone_reached')
            .order('timestamp_utc', { ascending: false })
            .limit(1);

        const streakDays =
            (streakEvents?.[0]?.event_properties as Record<string, number> | null)?.streak_days ?? 0;

        if (reportTo) {
            const ok = await sendResend(
                reportTo,
                'Perfect Trader — re-engagement candidate',
                `<p>User <code>${userId}</code> has no pre-plan in 3+ days. Last streak milestone: ${streakDays} days.</p>`
            );
            if (ok) emailsSent += 1;
        }
    }

    return new Response(
        JSON.stringify({
            ok: true,
            inactive_users: inactive.length,
            emails_sent: emailsSent,
            note: reportTo ? undefined : 'Set BETA_REPORT_EMAIL or RESEND_API_KEY to send mail',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
});
