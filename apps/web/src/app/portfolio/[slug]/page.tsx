import { redirect } from 'next/navigation';

export default async function PortfolioSlugRedirect({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolved = await params;
  redirect(`/projects/${resolved.slug}`);
}
