'use client';

import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Maximize, Clock, ShieldCheck, Video, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

const REELS = [
  {
    id: 'reel-1',
    title: 'Cinematic Master Reel 2026',
    category: 'Commercial & Narrative',
    description: 'Our primary showcase featuring a high-octane blend of commercial narrative campaigns, automotive sequences, and stylized fashion segments. Shot on location across Mumbai, London, and Berlin.',
    videoUrl: 'https://res.cloudinary.com/dd29usied/video/upload/v1785067564/banners/apy8yqvmj3nbdq4gvikp.mp4',
    coverImage: '/images/portfolio-hero.webp',
    duration: '0:39',
    camera: 'ARRI ALEXA 35 (8K Open Gate)',
    lenses: 'Cooke Anamorphic /i Special Flare',
    colorGrade: 'Dolby Vision HDR · Kodak 2383 Emulation'
  },
  {
    id: 'reel-2',
    title: 'Midnight Anthem & Editorial Showreel',
    category: 'Music Video & Fashion',
    description: 'Deep exploration of lighting setups, shadow manipulation, and hyper-stylized editorial world-building. Focusing on rapid pacing and music synchronization.',
    videoUrl: 'https://res.cloudinary.com/dd29usied/video/upload/v1785067585/banners/wgxkr2c7lnnc2gr1jyyx.mp4',
    coverImage: '/images/about-bts.webp',
    duration: '0:42',
    camera: 'RED V-Raptor XL 8K VV',
    lenses: 'Panavision C-Series Anamorphic',
    colorGrade: 'High-Contrast Cyberpunk Technicolor Grade'
  },
  {
    id: 'reel-3',
    title: 'Commercial Narrative & Organic Showreel',
    category: 'Brand Campaign',
    description: 'Stark coastal vistas, warm organic textures, and documentary-style cinematography. Highlighting natural light control and intimate human stories.',
    videoUrl: 'https://res.cloudinary.com/dd29usied/video/upload/v1785067614/banners/nbu8svb9hfos3l1pe9le.mp4',
    coverImage: '/images/services-lighting.webp',
    duration: '0:35',
    camera: 'ARRI ALEXA Mini LF',
    lenses: 'Zeiss Supreme Primes Radiance',
    colorGrade: 'Warm Gold Organic Film Grain Grade'
  },
  {
    id: 'reel-4',
    title: 'Skyline & Architectural Showcase',
    category: 'Documentary & Corporate',
    description: 'Dynamic framing, corporate branding, and precision motion control. Focused on high-concept architectural design and modern technical execution.',
    videoUrl: 'https://res.cloudinary.com/dd29usied/video/upload/v1786782468/yogsathi/videos/pq1yysen8p85vso4rsye.mp4',
    coverImage: '/images/careers-meeting.webp',
    duration: '0:38',
    camera: 'Sony VENICE 2 8K',
    lenses: 'Arri/Zeiss Master Anamorphic',
    colorGrade: 'Monochrome Silver Retention Emulation'
  }
];

export default function ReelPage() {
  const [reels, setReels] = useState(REELS);
  const [activeReel, setActiveReel] = useState(REELS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch dynamic showreels from CMS config
  useEffect(() => {
    async function fetchReels() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mp-backend-api.onrender.com/api/v1';
        const res = await fetch(`${apiUrl}/cms/config/showreels`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const val = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
            if (Array.isArray(val) && val.length > 0) {
              setReels(val);
              setActiveReel(val[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch showreels from CMS:', err);
      }
    }
    fetchReels();
  }, []);

  // Sync play state when active reel changes
  useEffect(() => {
    if (videoRef.current) {
      // Don't call .load() — changing src attribute already resets the video.
      // Just attempt playback; if paused let user control.
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [activeReel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-(--cinematic-bg) text-(--cinematic-text) transition-colors duration-300 flex flex-col pt-24 selection:bg-brand/30 selection:text-current">
      <Navbar />

      <main className="flex-1">
        {/* Dynamic Theater Header */}
        <section className="relative w-full bg-(--cinematic-bg-elevated)/45 border-b border-(--cinematic-border) py-12 md:py-16 transition-colors duration-300">
          <Container className="max-w-7xl">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
              <Reveal direction="up" className="max-w-2xl">
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-brand/5 border border-brand/20 text-[10px] font-mono tracking-widest text-brand uppercase mb-4">
                  <Video className="w-3.5 h-3.5" />
                  <span>Cinematic Archives</span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-display font-light leading-none tracking-tight text-(--cinematic-text) mb-4">
                  THE SHOWREELS
                </h1>
                <p className="text-(--cinematic-text-muted) font-light text-sm sm:text-base leading-relaxed">
                  Our comprehensive showreel collection. Toggle between different reels below to explore our work in commercial, narrative, fashion, and documentary spaces.
                </p>
              </Reveal>
            </div>

            {/* Main Theater Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Theater Screen */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-(--cinematic-border) shadow-[0_0_80px_rgba(235,61,38,0.1)] group">
                  <video
                    ref={videoRef}
                    src={activeReel.videoUrl}
                    poster={activeReel.coverImage}
                    autoPlay={isPlaying}
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Play Overlay Button */}
                  {!isPlaying && (
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-opacity duration-300 z-10"
                    >
                      <button className="h-20 w-20 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center backdrop-blur-md hover:scale-105 hover:bg-white hover:text-black transition-all duration-300 shadow-2xl">
                        <Play className="w-6 h-6 ml-1 fill-current" />
                      </button>
                    </div>
                  )}

                  {/* Custom Controls Bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-20 flex flex-col gap-4">
                    {/* Progress Bar */}
                    <div 
                      onClick={handleProgressClick}
                      className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer relative overflow-hidden group/progress"
                    >
                      <div 
                        style={{ width: `${progress}%` }}
                        className="h-full bg-brand rounded-full transition-all duration-100 relative"
                      />
                    </div>

                    {/* Buttons Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-brand transition-colors">
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                        <button onClick={restartVideo} className="text-white hover:text-brand transition-colors">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={toggleMute} className="text-white hover:text-brand transition-colors flex items-center gap-2">
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <span className="text-[10px] font-mono text-white/50 tracking-wider">
                          {activeReel.duration} MIN SHOWCASE
                        </span>
                      </div>
                      <div>
                        <button onClick={handleFullscreen} className="text-white hover:text-brand transition-colors">
                          <Maximize className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theater Specs & Details Panel */}
              <div className="lg:col-span-4 flex flex-col justify-between p-8 rounded-2xl bg-(--cinematic-bg-elevated) border border-(--cinematic-border) shadow-2xl relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-brand uppercase block mb-1">
                      {activeReel.category}
                    </span>
                    <h2 className="text-2xl font-display font-light text-(--cinematic-text) leading-tight">
                      {activeReel.title}
                    </h2>
                  </div>

                  <p className="text-(--cinematic-text-muted) text-xs leading-relaxed font-light">
                    {activeReel.description}
                  </p>

                  <div className="h-[1px] w-full bg-(--cinematic-border)" />

                  {/* Technical Spec Grid */}
                  <div className="space-y-4 font-mono text-[10px] text-(--cinematic-text)">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-(--cinematic-text-muted)/60 uppercase">Primary Capture</span>
                      <span className="text-(--cinematic-text) font-medium">{activeReel.camera}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-(--cinematic-text-muted)/60 uppercase">Optics Profile</span>
                      <span className="text-(--cinematic-text) font-medium">{activeReel.lenses}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-(--cinematic-text-muted)/60 uppercase">Color Standard</span>
                      <span className="text-(--cinematic-text) font-medium">{activeReel.colorGrade}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-(--cinematic-border) flex items-center justify-between text-[9px] font-mono text-(--cinematic-text-muted)/50">
                  <span className="flex items-center gap-1.5 uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                    Verified Production
                  </span>
                  <span>EST. 2026</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Reels Selection Grid */}
        <section className="py-24">
          <Container className="max-w-7xl">
            <h2 className="text-xs font-mono tracking-[0.25em] text-(--cinematic-text-muted)/50 uppercase mb-8 pb-4 border-b border-(--cinematic-border)">
              Available Showreels ({reels.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reels.map((reel) => {
                const isActive = activeReel.id === reel.id;
                return (
                  <div
                    key={reel.id}
                    onClick={() => {
                      setActiveReel(reel);
                      setIsPlaying(true);
                    }}
                    className={cn(
                      "group relative flex flex-col justify-end overflow-hidden cursor-pointer rounded-xl transition-all duration-300 border bg-(--cinematic-bg-elevated)",
                      isActive 
                        ? "border-brand shadow-[0_0_30px_rgba(235,61,38,0.15)] scale-[1.01]" 
                        : "border-(--cinematic-border) hover:border-brand/40"
                    )}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden opacity-85 group-hover:opacity-100 transition-opacity">
                      <img
                        src={reel.coverImage}
                        alt={reel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md group-hover:bg-brand group-hover:scale-105 transition-all">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </span>
                      </div>
                    </div>

                    {/* Detail Strip */}
                    <div className="p-5 space-y-2">
                      <span className="text-[8px] font-mono tracking-widest text-(--cinematic-text-muted)/55 uppercase">
                        {reel.category}
                      </span>
                      <h3 className={cn(
                        "text-sm font-semibold tracking-wide truncate transition-colors duration-300",
                        isActive ? "text-brand" : "text-(--cinematic-text) group-hover:text-brand"
                      )}>
                        {reel.title}
                      </h3>
                      <p className="text-[10px] text-(--cinematic-text-muted) line-clamp-2 leading-relaxed font-light">
                        {reel.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
