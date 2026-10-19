"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { SocialShareModal } from '@/components/ui/SocialShareModal';

export default function BlogPostPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  // Guard against "null"/"undefined"/empty strings arriving in the query so a
  // published post is never treated as a (failed) preview request.
  const rawPreview = searchParams?.get('preview');
  const previewToken = rawPreview && rawPreview !== 'null' && rawPreview !== 'undefined' ? rawPreview : null;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    const fetchUrl = previewToken
      ? `${apiUrl}/cms/preview/blog/${slug}?token=${previewToken}`
      : `${apiUrl}/cms/blog/${slug}`;

    fetch(fetchUrl)
      .then(r => r.json())
      .then(res => {
        if (res && res.success && res.data) {
          setPost(res.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load blog post.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, previewToken]);

  if (!loading && !post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="page-content py-12">
        <Container size="md">
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Journal</span>
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-8">
              <div className="h-6 bg-muted/40 rounded w-32" />
              <div className="h-16 bg-muted/40 rounded w-full" />
              <div className="h-[400px] bg-muted/40 rounded-2xl w-full" />
              <div className="space-y-4 pt-8">
                <div className="h-4 bg-muted/40 rounded w-full" />
                <div className="h-4 bg-muted/40 rounded w-full" />
                <div className="h-4 bg-muted/40 rounded w-3/4" />
              </div>
            </div>
          ) : (
            <Reveal direction="up">
              <article className="space-y-8">
                <div>
                  <span className="text-accent uppercase tracking-widest text-xs font-semibold mb-4 block">
                    {post.category || "Production"}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6 leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4 my-8">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>{post.author || "Admin"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{post.date || new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.readTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{post.readTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(post.img || post.coverImage || post.coverImageUrl) && (
                  <div className="w-full max-h-[80vh] min-h-[380px] rounded-2xl overflow-hidden border border-border shadow-2xl bg-black/60 flex items-center justify-center relative my-6">
                    <img 
                      src={post.img || post.coverImage || post.coverImageUrl} 
                      alt={post.title} 
                      className="w-full h-auto max-h-[80vh] object-contain md:object-cover object-top rounded-2xl" 
                    />
                  </div>
                )}

                <div className="prose dark:prose-invert max-w-none pt-6 space-y-6 text-foreground font-light leading-relaxed">
                  {post.content ? (
                    <div 
                      className="text-base md:text-lg space-y-6 [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-serif [&_h2]:text-foreground [&_h2]:font-normal [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-serif [&_h3]:text-foreground [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:font-light [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-foreground/90 [&_blockquote]:bg-surface/50 [&_blockquote]:rounded-r-lg [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  ) : (
                    <p className="text-lg text-muted-foreground font-light">{post.excerpt || "Article content loading..."}</p>
                  )}
                </div>

                <div className="border-t border-border pt-12 mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-foreground font-serif text-xl mb-1">Enjoyed this article?</h4>
                    <p className="text-sm text-muted-foreground font-light">Share it with your production network or team.</p>
                  </div>
                  <Button
                    onClick={() => setIsShareOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Article
                  </Button>
                </div>
              </article>
            </Reveal>
          )}
        </Container>
      </main>

      <SocialShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={post?.title || 'MP Production Article'}
        description={post?.excerpt || 'Read this article on MP Production'}
        image={post?.coverImage}
        category={post?.category || 'Editorial'}
      />
    </>
  );
}
