import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { notFound } from 'next/navigation';

export default async function ProjectDetails({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  let project = null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const res = await fetch(`${apiUrl}/cms/portfolio/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        project = json.data;
      }
    }
  } catch (err) {
    console.error('Error fetching project details:', err);
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      {/* Hero Header */}
      <section className="relative h-[80vh] w-full flex items-end pb-24 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0 bg-black">
          {project.mediaUrl && (
            <img src={project.mediaUrl} alt={project.title} className="w-full h-full object-cover scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
        </div>
        <Container className="relative z-10 w-full">
          <Reveal direction="up">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-primary font-semibold mb-4">
              <span>{project.category}</span>
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-white/70">{project.year}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display leading-[0.9] text-white">
              {project.title}
            </h1>
          </Reveal>
        </Container>
      </section>

      {/* Details & Video */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Meta Data Sidebar */}
            <div className="lg:col-span-4">
              <Reveal direction="up" delay={0.2} className="space-y-8 sticky top-32">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Category</h3>
                  <p className="text-lg font-medium text-foreground">{project.category}</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Year</h3>
                  <p className="text-lg font-medium text-foreground">{project.year || new Date().getFullYear()}</p>
                </div>
                <hr className="border-border" />
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {project.description || 'No description available for this project.'}
                </p>
              </Reveal>
            </div>

            {/* Real Video Player or Cover Image */}
            <div className="lg:col-span-8">
              <Reveal direction="up" delay={0.3}>
                {project.videoUrl ? (
                  <VideoPlayer videoUrl={project.videoUrl} posterUrl={project.mediaUrl} />
                ) : project.mediaUrl ? (
                  <div className="w-full aspect-video bg-surface rounded-2xl overflow-hidden relative border border-border">
                    <img src={project.mediaUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                ) : null}
                
                {/* Additional Gallery Images */}
                {project.galleryImages && project.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {project.galleryImages.map((imgUrl: string, i: number) => (
                      <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border border-border">
                        <img src={imgUrl} alt={`${project.title} gallery ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </Reveal>
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
}
