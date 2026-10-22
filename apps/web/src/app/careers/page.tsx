import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Palette, Camera, Home, BookOpen, HeartPulse, Sun } from 'lucide-react';

const openPositions = [
  {
    title: "Senior Cinematographer",
    department: "Production",
    location: "Mumbai, India",
    type: "Full-time",
    description: "Lead camera operations on commercial and narrative shoots. Must be proficient with RED, ARRI, and Sony cinema systems."
  },
  {
    title: "Video Editor (Premiere Pro)",
    department: "Post-Production",
    location: "Remote / Mumbai",
    type: "Full-time",
    description: "Edit brand campaigns, short-form content, and social reels. Strong sense of pacing and storytelling required."
  },
  {
    title: "Talent Coordinator",
    department: "Talent Management",
    location: "Mumbai, India",
    type: "Full-time",
    description: "Manage our talent roster, coordinate casting calls, and handle client hire requests. Experience in talent agencies preferred."
  },
  {
    title: "Motion Graphics Designer",
    department: "Post-Production",
    location: "Remote",
    type: "Contract",
    description: "Create lower thirds, title cards, and animated brand elements in After Effects and Cinema 4D."
  },
  {
    title: "Production Assistant",
    department: "Production",
    location: "Mumbai Studio, India",
    type: "Full-time",
    description: "On-set support including equipment management, crew coordination, and logistics. Entry-level position — passion for filmmaking is a must."
  },
];

const perks = [
  { title: "Creative Freedom", desc: "Work on diverse projects from automotive to fashion. No two days are the same.", icon: <Palette className="w-6 h-6 text-primary" /> },
  { title: "Equipment Access", desc: "Unlimited access to our RED, ARRI, and DJI inventory for personal projects.", icon: <Camera className="w-6 h-6 text-primary" /> },
  { title: "Remote Flexibility", desc: "Post-production roles offer full remote work. Shoot crew works on-location.", icon: <Home className="w-6 h-6 text-primary" /> },
  { title: "Learning Budget", desc: "₹50,000/year for courses, workshops, and conferences of your choice.", icon: <BookOpen className="w-6 h-6 text-primary" /> },
  { title: "Health Insurance", desc: "Comprehensive health coverage for you and your family from day one.", icon: <HeartPulse className="w-6 h-6 text-primary" /> },
  { title: "Paid Time Off", desc: "30 days PTO plus national holidays. We believe rest fuels creativity.", icon: <Sun className="w-6 h-6 text-primary" /> },
];

export default function Careers() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
        {/* Header Section — Full Bleed Merged With Navbar */}
        <section className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden mb-20 text-center pt-28 sm:pt-36">
          <img 
            src="/images/careers-meeting.webp" 
            alt="Careers at MP Productions" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          
          {/* Top Vignette Gradient for Navbar Contrast */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-1 pointer-events-none" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40 z-1" />
          <div className="absolute bottom-0 left-0 right-0 h-40 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent z-2" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                Join Us
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg">
                BUILD THE FUTURE <br /> OF MEDIA
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                We're looking for passionate creatives, technologists, and storytellers to join our team. If you live and breathe cinema, you belong here.
              </p>
            </Reveal>
          </Container>
        </section>

        <Container>
          {/* Empty since hero was moved */}

          {/* Studio Culture Banner */}
          <Reveal direction="up" delay={0.1}>
            <div className="relative aspect-[21/9] overflow-hidden rounded-sm mb-24 group cursor-pointer border border-border">
              <img 
                src="/images/careers-office.webp" 
                alt="Studio Culture" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                <h2 className="text-4xl md:text-5xl font-serif text-white text-center px-4">
                  Where Creativity Meets Precision
                </h2>
              </div>
            </div>
          </Reveal>

          {/* Perks */}
          <section className="mb-24">
            <Reveal direction="up">
              <div className="flex flex-col items-center gap-4">
                <img src="/logo.webp" alt="MP Productions" className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(235,61,38,0.2)]" />
                <h2 className="text-3xl font-serif text-foreground text-center">Why Join Us?</h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {perks.map((perk, idx) => (
                <Reveal key={idx} direction="up" delay={idx * 0.05}>
                  <Card hover>
                    <div className="mb-4">{perk.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{perk.title}</h3>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed">{perk.desc}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Open Positions */}
          <section>
            <Reveal direction="up">
              <h2 className="text-3xl font-serif text-foreground text-center mb-12">Open Positions</h2>
            </Reveal>
            <div className="space-y-4">
              {openPositions.map((pos, idx) => (
                <Reveal key={idx} direction="up" delay={idx * 0.05}>
                  <Card hover className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex-grow">
                      <h3 className="text-xl font-serif text-foreground group-hover:text-primary transition-colors mb-1">{pos.title}</h3>
                      <p className="text-muted-foreground font-light text-sm mb-3">{pos.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-surface-elevated text-muted-foreground text-xs rounded-sm">{pos.department}</span>
                        <span className="px-3 py-1 bg-surface-elevated text-muted-foreground text-xs rounded-sm">{pos.location}</span>
                        <span className="px-3 py-1 bg-surface-elevated text-muted-foreground text-xs rounded-sm">{pos.type}</span>
                      </div>
                    </div>
                    <Button href="/contact" size="sm" variant="outline">
                      Apply Now
                    </Button>
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>

        </Container>
      </main>
    </>
  );
}
