export type BlogPost = {
    slug: string;
    title: string;
    excerpt: string;
    category: 'Psychology' | 'Product' | 'Education' | 'Data';
    publishedAt: string;
    readMinutes: number;
    body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: 'why-pnl-is-the-wrong-scorecard',
        title: 'Why P&L Is the Wrong Scorecard for Day Traders',
        excerpt:
            'Profitable days can still be undisciplined days. Here is why behavior grades matter more than green candles.',
        category: 'Psychology',
        publishedAt: '2026-05-21',
        readMinutes: 6,
        body: [
            'Most traders judge the day by one number: net P&L. That number hides whether you followed your rules, traded your plan, or took revenge entries after a win.',
            'The Perfect Trader tracks compliance first — mood at open, rules checked per trade, and a daily discipline grade. P&L becomes context, not identity.',
            'When you separate **work data** (trades, rules, grades) from **thoughts** (journal notes, diary scans, coaching memory), you see patterns brokers never export.',
            'Beta users get full access while we validate the loop: pre-session → trade log → review. No stock tips — just the architecture of consistent execution.',
        ],
    },
    {
        slug: 'pre-session-checklist-five-minutes',
        title: 'The 5-Minute Pre-Session Checklist',
        excerpt:
            'A short emotional baseline and rule lock before the open reduces tilt trades more than another indicator.',
        category: 'Education',
        publishedAt: '2026-05-21',
        readMinutes: 5,
        body: [
            'Professional desks run a pre-market brief. Retail traders often skip straight to the chart — and pay for it by 10:15.',
            'Our Today screen asks for emotional baseline, session notes, and rule acknowledgment before you log trades.',
            'Five minutes is enough: rate mood, read active rules aloud, set max trades, lock rules when ready.',
            'This is not financial advice — it is a behavior ritual. The goal is fewer trades you regret, not more trades total.',
        ],
    },
    {
        slug: 'introducing-perfect-trader-beta',
        title: 'Introducing The Perfect Trader Beta',
        excerpt:
            'Psychology-first discipline journaling is live. All features free during beta — help us shape what ships next.',
        category: 'Product',
        publishedAt: '2026-05-21',
        readMinutes: 4,
        body: [
            'We built The Perfect Trader for traders who break rules under stress — not for signal chasing.',
            'During **closed beta**, every feature is free: Today loop, Rules, Journal, Stats, Diary scans, and cloud sync via Supabase.',
            'Your data is stored in your account with row-level security. Thoughts (diary, psychology) are separated from work data (trades, grades) by design.',
            'Join via the beta page, use the product daily, and tell us what would make you pay when Pro launches.',
        ],
    },
];

export function getPost(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((p) => p.slug === slug);
}
