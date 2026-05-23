import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog';
import { APP_NAME } from '@/lib/brand';

export default function BlogIndexPage() {
    return (
        <div className="min-h-[100dvh] bg-white text-[#1a1a2e]">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 font-bold text-[14px] mb-10">
                    <ArrowLeft size={18} />
                    Home
                </Link>
                <h1 className="text-[40px] font-black tracking-tighter mb-2">{APP_NAME} Blog</h1>
                <p className="text-gray-500 font-medium mb-12">Psychology, discipline, and product updates — not stock picks.</p>
                <div className="flex flex-col gap-6">
                    {BLOG_POSTS.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block p-8 rounded-[28px] border border-gray-100 hover:border-[#1a1a2e]/20 hover:shadow-lg "
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#f59e0b]">
                                {post.category}
                            </span>
                            <h2 className="text-[22px] font-black mt-2 mb-2">{post.title}</h2>
                            <p className="text-[14px] text-gray-500 font-medium">{post.excerpt}</p>
                            <p className="text-[12px] text-gray-400 font-bold mt-4">
                                {post.publishedAt} · {post.readMinutes} min read
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
