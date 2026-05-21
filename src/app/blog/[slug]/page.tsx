import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPost, BLOG_POSTS } from '@/lib/blog';

export function generateStaticParams() {
    return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) notFound();

    return (
        <div className="min-h-[100dvh] bg-white text-[#1a1a2e]">
            <article className="max-w-2xl mx-auto px-6 py-12">
                <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 font-bold text-[14px] mb-10">
                    <ArrowLeft size={18} />
                    Blog
                </Link>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#f59e0b]">{post.category}</span>
                <h1 className="text-[32px] md:text-[40px] font-black tracking-tight mt-2 mb-4">{post.title}</h1>
                <p className="text-[13px] font-bold text-gray-400 mb-10">
                    {post.publishedAt} · {post.readMinutes} min read
                </p>
                <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-gray-600 font-medium">
                    {post.body.map((para) => (
                        <p key={para.slice(0, 24)}>{para}</p>
                    ))}
                </div>
                <Link
                    href="/signup"
                    className="inline-flex mt-12 h-14 px-8 bg-[#1a1a2e] text-white rounded-full font-black items-center"
                >
                    Try the beta free
                </Link>
            </article>
        </div>
    );
}
