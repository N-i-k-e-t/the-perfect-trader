export type ResourceStatus = 'backlog' | 'in_progress' | 'done' | 'blocked';

export type ResourceRow = {
    id: string;
    name: string;
    category: 'People' | 'Design' | 'Dev' | 'Legal' | 'Infra' | 'Marketing';
    neededFor: 'App' | 'Platform' | 'GTM' | 'Legal';
    priority: 'P0' | 'P1' | 'P2';
    effort: 'S' | 'M' | 'L';
    owner: string;
    status: ResourceStatus;
};

export const RESOURCE_DASHBOARD: ResourceRow[] = [
    { id: 'R-001', name: 'Privacy policy v1 (cloud + AI)', category: 'Legal', neededFor: 'Platform', priority: 'P0', effort: 'M', owner: 'Founder', status: 'done' },
    { id: 'R-002', name: 'Terms + beta clause', category: 'Legal', neededFor: 'Platform', priority: 'P0', effort: 'M', owner: 'Founder', status: 'done' },
    { id: 'R-003', name: 'Beta mode — no paywall', category: 'Dev', neededFor: 'App', priority: 'P0', effort: 'S', owner: 'Dev', status: 'done' },
    { id: 'R-004', name: 'Cookie policy + banner', category: 'Legal', neededFor: 'Platform', priority: 'P0', effort: 'S', owner: 'Dev', status: 'done' },
    { id: 'R-005', name: 'About page', category: 'Marketing', neededFor: 'GTM', priority: 'P1', effort: 'S', owner: 'Founder', status: 'done' },
    { id: 'R-006', name: 'Blog + first posts', category: 'Marketing', neededFor: 'GTM', priority: 'P1', effort: 'M', owner: 'Copy', status: 'done' },
    { id: 'R-007', name: 'PWA icons 192/512', category: 'Design', neededFor: 'App', priority: 'P0', effort: 'S', owner: 'Design', status: 'backlog' },
    { id: 'R-008', name: 'OG image 1200×630', category: 'Design', neededFor: 'GTM', priority: 'P1', effort: 'S', owner: 'Design', status: 'backlog' },
    { id: 'R-009', name: 'Hero video (compressed)', category: 'Design', neededFor: 'GTM', priority: 'P1', effort: 'M', owner: 'Design', status: 'backlog' },
    { id: 'R-010', name: 'Product screenshots', category: 'Design', neededFor: 'GTM', priority: 'P1', effort: 'M', owner: 'Design', status: 'backlog' },
    { id: 'R-011', name: 'Landing copy audit', category: 'Marketing', neededFor: 'GTM', priority: 'P1', effort: 'S', owner: 'Copy', status: 'in_progress' },
    { id: 'R-012', name: '20 beta trader interviews', category: 'People', neededFor: 'GTM', priority: 'P0', effort: 'L', owner: 'Founder', status: 'backlog' },
    { id: 'R-013', name: 'Analytics (PostHog)', category: 'Infra', neededFor: 'Platform', priority: 'P2', effort: 'S', owner: 'Dev', status: 'backlog' },
    { id: 'R-014', name: 'Stripe subscriptions', category: 'Dev', neededFor: 'App', priority: 'P2', effort: 'L', owner: 'Dev', status: 'backlog' },
    { id: 'R-015', name: 'Press kit PDF', category: 'Marketing', neededFor: 'GTM', priority: 'P2', effort: 'M', owner: 'PR', status: 'backlog' },
    { id: 'R-016', name: 'Staging Supabase', category: 'Infra', neededFor: 'Platform', priority: 'P2', effort: 'M', owner: 'Dev', status: 'backlog' },
    { id: 'R-017', name: 'Sentry error tracking', category: 'Infra', neededFor: 'Platform', priority: 'P2', effort: 'S', owner: 'Dev', status: 'backlog' },
    { id: 'R-018', name: 'Founder photos / About', category: 'Design', neededFor: 'GTM', priority: 'P1', effort: 'S', owner: 'Design', status: 'backlog' },
    { id: 'R-019', name: 'Welcome email templates', category: 'Marketing', neededFor: 'Platform', priority: 'P1', effort: 'M', owner: 'Copy', status: 'backlog' },
    { id: 'R-020', name: 'Export + delete account', category: 'Dev', neededFor: 'Legal', priority: 'P1', effort: 'M', owner: 'Dev', status: 'in_progress' },
];
