import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
    const base = SITE_URL.replace(/\/$/, '');
    const now = new Date();
    const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
        { path: '', priority: 1, changeFrequency: 'weekly' },
        { path: '/beta', priority: 0.9, changeFrequency: 'daily' },
        { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/help', priority: 0.6, changeFrequency: 'monthly' },
        { path: '/changelog', priority: 0.6, changeFrequency: 'weekly' },
        { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
        { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
        { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
        { path: '/security', priority: 0.4, changeFrequency: 'yearly' },
        { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
        { path: '/refund', priority: 0.3, changeFrequency: 'yearly' },
    ];

    return routes.map((r) => ({
        url: `${base}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));
}
