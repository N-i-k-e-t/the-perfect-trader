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

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const reportTo = Deno.env.get('BETA_REPORT_EMAIL') ?? Deno.env.get('NEXT_PUBLIC_SUPPORT_EMAIL');

    const { data: events } = await supabase
        .from('user_events')
        .select('event_name, user_id, event_properties')
        .gte('timestamp_utc', weekAgo);

    const list = events ?? [];
    const dau = new Set(list.map((e) => e.user_id).filter(Boolean)).size;

    const byEvent: Record<string, number> = {};
    for (const e of list) {
        byEvent[e.event_name] = (byEvent[e.event_name] ?? 0) + 1;
    }
    const topFeatures = Object.entries(byEvent)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const parsed = list.filter((e) => e.event_name === 'trade_ai_parsed').length;
    const accepted = list.filter((e) => e.event_name === 'trade_ai_parse_accepted').length;
    const parseRate = parsed > 0 ? Math.round((100 * accepted) / parsed) : 0;

    const coachShown = list.filter((e) => e.event_name === 'coach_message_shown').length;
    const coachDismiss = list.filter((e) => e.event_name === 'coach_message_dismissed').length;
    const dismissRate = coachShown > 0 ? Math.round((100 * coachDismiss) / coachShown) : 0;

    const html = `
<h1>Perfect Trader — Weekly Beta Report</h1>
<p><strong>DAU (unique users, 7d):</strong> ${dau}</p>
<h2>Top features</h2>
<ul>${topFeatures.map(([n, c]) => `<li>${n}: ${c}</li>`).join('')}</ul>
<p><strong>AI parse acceptance:</strong> ${parseRate}%</p>
<p><strong>Coach dismiss rate:</strong> ${dismissRate}%</p>
<p>Run saved queries in docs/analytics/SAVED_QUERIES.sql for full detail.</p>`;

    let sent = false;
    if (reportTo) {
        sent = await sendResend(reportTo, 'Perfect Trader — Weekly Beta Report', html);
    }

    return new Response(
        JSON.stringify({ ok: true, dau, topFeatures, parseRate, dismissRate, email_sent: sent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
});
