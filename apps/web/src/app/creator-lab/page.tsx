'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { HoverFooter as Footer } from '@/components/ui/hover-footer';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import {
  Play,
  CheckCircle2,
  Download,
  BookOpen,
  Tv,
  Users,
  Award,
  Sparkles,
  Lock,
  Unlock,
  ChevronRight,
  FileText,
  Video,
  Layers,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { verifyStudentSessionToken, verifyCourseAccess256 } from '@/lib/security';

interface ModuleLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

interface StudentCourse {
  id: string;
  title: string;
  categoryLabel: string;
  instructor: string;
  progress: number;
  image: string;
  lessons: ModuleLesson[];
  resources: { title: string; size: string; downloadUrl: string }[];
}

const UNLOCKED_COURSES_DATA: Record<string, StudentCourse> = {
  'course-youtuber': {
    id: 'course-youtuber',
    title: 'How to Become a YouTuber: 100K Algorithm & 4K Setup',
    categoryLabel: 'YouTube Masterclass',
    instructor: 'Rohan Verma',
    progress: 35,
    image: '/images/services-lighting.webp',
    lessons: [
      { id: 'l1', title: 'Lesson 1.1: Sony Log & Canon 10-Bit Camera Setup', duration: '14:20', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 'l2', title: 'Lesson 1.2: 3-Point Key & Ambient Studio Lighting', duration: '18:45', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 'l3', title: 'Lesson 2.1: The 3-Second Hook & Retention Graph Hacking', duration: '22:10', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
      { id: 'l4', title: 'Lesson 2.2: High-CTR Thumbnail Design & A/B Testing', duration: '16:05', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
    ],
    resources: [
      { title: 'MP Production 4K Sony/Canon LUT Pack (.cube)', size: '45 MB', downloadUrl: '#' },
      { title: 'High-CTR Thumbnail Photoshop Template (.psd)', size: '120 MB', downloadUrl: '#' },
      { title: '100K YouTube Scriptwriting Checklist (.pdf)', size: '4 MB', downloadUrl: '#' },
    ],
  },
  'course-reeler': {
    id: 'course-reeler',
    title: 'How to Become an Instagram Reeler: Viral 9:16 Secrets',
    categoryLabel: 'Instagram Reels',
    instructor: 'Aanya Kapoor',
    progress: 60,
    image: '/assets/project-fashion.webp',
    lessons: [
      { id: 'l1', title: 'Lesson 1.1: 9:16 Mobile Composition & Lighting', duration: '12:10', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 'l2', title: 'Lesson 1.2: Beat-Sync Editing & High-Energy Cuts', duration: '15:30', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
    ],
    resources: [
      { title: '25+ Premiere Pro Seamless Transitions', size: '85 MB', downloadUrl: '#' },
      { title: 'Viral Reels Sound FX Pack', size: '60 MB', downloadUrl: '#' },
    ],
  },
};

function CreatorLabContent() {
  const searchParams = useSearchParams();
  const unlockedCourseParam = searchParams.get('unlockedCourse') || 'course-youtuber';
  
  const [activeCourse, setActiveCourse] = useState<StudentCourse>(
    UNLOCKED_COURSES_DATA[unlockedCourseParam] || UNLOCKED_COURSES_DATA['course-youtuber']
  );
  const [activeLesson, setActiveLesson] = useState<ModuleLesson>(activeCourse.lessons[0]);
  const [unlockedCourseIds, setUnlockedCourseIds] = useState<string[]>([]);

  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState<boolean>(false);
  const [studentUser, setStudentUser] = useState<{ name: string; email: string } | null>(null);

  const [realtimeStatus, setRealtimeStatus] = useState<'IDLE' | 'PENDING_APPROVAL' | 'APPROVED' | 'BLOCKED'>('IDLE');

  async function checkRealtimeAccess() {
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('mp_student_email') || '';
      if (!email) return;
      try {
        const res = await fetchAPI(`/cms/students/check-status?email=${encodeURIComponent(email)}&courseId=${activeCourse.id}`);
        if (res) {
          if (res.isBlocked) {
            setRealtimeStatus('BLOCKED');
          } else if (res.isUnlocked || res.status === 'APPROVED') {
            setRealtimeStatus('APPROVED');
            if (!unlockedCourseIds.includes(activeCourse.id)) {
              setUnlockedCourseIds(prev => [...prev, activeCourse.id]);
            }
          } else if (res.status === 'PENDING_APPROVAL') {
            setRealtimeStatus('PENDING_APPROVAL');
          }
        }
      } catch (e) {
        const pendingMap = JSON.parse(localStorage.getItem('mp_pending_utrs') || '{}');
        if (pendingMap[activeCourse.id]) {
          setRealtimeStatus('PENDING_APPROVAL');
        }
      }
    }
  }

  useEffect(() => {
    async function run256bitVerification() {
      if (typeof window !== 'undefined') {
        const secToken = sessionStorage.getItem('mp_sec_token') || '';
        const { isValid, payload } = await verifyStudentSessionToken(secToken);

        if (isValid && payload) {
          setIsStudentLoggedIn(true);
          setStudentUser({ name: payload.name, email: payload.email });
        } else {
          const loggedIn = sessionStorage.getItem('mp_student_logged_in') === 'true';
          const name = sessionStorage.getItem('mp_student_name');
          const email = sessionStorage.getItem('mp_student_email');
          setIsStudentLoggedIn(loggedIn);
          if (loggedIn && name) {
            setStudentUser({ name, email: email || '' });
          }
        }

        const cached = JSON.parse(localStorage.getItem('mp_unlocked_courses') || '[]');
        const verifiedCourseList: string[] = [];

        for (const cid of cached) {
          const isProofValid = await verifyCourseAccess256(cid, payload?.email || '');
          if (isProofValid) {
            verifiedCourseList.push(cid);
          }
        }

        setUnlockedCourseIds(verifiedCourseList);
      }
    }
    run256bitVerification();
    checkRealtimeAccess();
  }, [activeCourse.id]);

  const isCourseUnlocked = unlockedCourseIds.includes(activeCourse.id);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand selection:text-white pt-28 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-8">
        {/* Student Portal Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MP Creator Student Portal & 4K Streaming Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-serif text-foreground">
              {isStudentLoggedIn ? `Welcome, ${studentUser?.name || 'Creator'}!` : 'My Creator Academy'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/become-a-youtuber"
              className="px-4 py-2 rounded-full border border-border bg-card text-xs font-bold hover:border-brand transition-colors"
            >
              Browse All Courses
            </Link>
            {isStudentLoggedIn ? (
              <span className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Student Account Active
              </span>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-full bg-brand text-white text-xs font-bold shadow-md hover:bg-brand/90 transition-colors"
              >
                Sign In Required
              </Link>
            )}
          </div>
        </div>

        {/* Video Player & Lessons Selector Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main 4K Video Player (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {!isStudentLoggedIn ? (
              /* ── Barrier 1: Unauthenticated Student Lock ── */
              <div className="p-8 sm:p-12 rounded-3xl border border-border bg-card text-center space-y-6 shadow-xl">
                <div className="h-20 w-20 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
                    <span>STUDENT AUTHENTICATION REQUIRED</span>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-foreground">
                    Please Sign In to Access Your Course
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You must sign in with your registered student account and complete payment verification to stream 4K video modules and download VIP toolkits.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                  <Link
                    href="/become-a-youtuber"
                    className="w-full bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl py-3 px-6 text-sm shadow-md text-center transition-all"
                  >
                    Enroll & Register Now →
                  </Link>
                  <Link
                    href="/login"
                    className="w-full bg-card hover:bg-muted text-foreground border border-border font-bold rounded-2xl py-3 px-6 text-sm text-center transition-colors"
                  >
                    Sign In Existing Account
                  </Link>
                </div>
              </div>
            ) : realtimeStatus === 'PENDING_APPROVAL' ? (
              /* ── Barrier 2A: Payment UTR Submitted & Pending Admin Approval ── */
              <div className="p-8 sm:p-12 rounded-3xl border border-amber-500/30 bg-card text-center space-y-6 shadow-xl">
                <div className="h-20 w-20 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                  <Clock className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
                    <span>⏳ PAYMENT UTR UNDER SUPER ADMIN REVIEW</span>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-foreground">
                    Verification in Progress
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hello <strong className="text-brand font-bold">{studentUser?.name}</strong>! Your 12-digit UPI UTR payment submission has been received and is being verified by Super Admin in the CMS.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-sm mx-auto text-xs text-amber-500 font-medium">
                  ⚡ Course video modules will unlock automatically as soon as Super Admin approves your UTR in the CMS!
                </div>

                <div className="pt-2 flex items-center justify-center max-w-sm mx-auto">
                  <Button
                    onClick={checkRealtimeAccess}
                    className="w-full bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl py-3 px-6 text-sm shadow-xl text-center transition-all gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Check Approval Status</span>
                  </Button>
                </div>
              </div>
            ) : !isCourseUnlocked ? (
              /* ── Barrier 2: Logged In But Course Unpaid Lock ── */
              <div className="p-8 sm:p-12 rounded-3xl border border-border bg-card text-center space-y-6 shadow-xl">
                <div className="h-20 w-20 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold uppercase tracking-wider">
                    <span>PAYMENT REQUIRED · COURSE LOCKED</span>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-foreground">
                    {activeCourse.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hello <strong className="text-brand font-bold">{studentUser?.name}</strong>! You have registered your account, but you have not completed the purchase for this masterclass yet.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border max-w-sm mx-auto flex items-center justify-between text-xs">
                  <div className="text-left">
                    <p className="font-bold text-foreground">{activeCourse.categoryLabel}</p>
                    <p className="text-muted-foreground">Lifetime Access + VIP LUTs</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand font-serif">₹4,999</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                  <Link
                    href={`/checkout?courseId=${activeCourse.id}`}
                    className="w-full bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl py-3 px-6 text-sm shadow-xl text-center transition-all transform hover:scale-[1.02]"
                  >
                    Complete Payment & Unlock Course →
                  </Link>
                </div>
              </div>
            ) : (
              /* ── Authenticated 4K Video Streamer ── */
              <>
                <div className="relative aspect-[16/9] w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-border">
                  <video
                    key={activeLesson.videoUrl}
                    src={activeLesson.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Video Lesson Meta */}
                <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">{activeCourse.categoryLabel}</span>
                    <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 4K Ultra HD Stream
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-serif">{activeLesson.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    Instructor: <strong className="text-foreground">{activeCourse.instructor}</strong> · Lesson Duration: <strong className="text-foreground">{activeLesson.duration}</strong>
                  </p>
                </div>

                {/* Downloadable VIP Resources Locker */}
                <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
                  <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-500" /> Downloadable Course VIP Toolkits
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCourse.resources.map((res, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-border bg-muted/30 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground line-clamp-1">{res.title}</p>
                          <p className="text-muted-foreground">{res.size}</p>
                        </div>
                        <button
                          onClick={() => toast.success(`📥 Starting Download for ${res.title}`)}
                          className="px-3 py-1.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand/90 transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Lessons Playlist & Unlocked Courses (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Playlist Box */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <h3 className="text-base font-bold font-serif border-b border-border pb-3 flex items-center justify-between">
                <span>Course Modules ({activeCourse.lessons.length})</span>
                <span className="text-xs text-emerald-500 font-bold">{activeCourse.progress}% Completed</span>
              </h3>

              <div className="space-y-2">
                {activeCourse.lessons.map((lesson, idx) => {
                  const isActive = activeLesson.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                        isActive
                          ? 'border-brand bg-brand/10 text-brand shadow-sm font-bold'
                          : 'border-border bg-muted/20 text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          isActive ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold line-clamp-1">{lesson.title}</p>
                          <p className="text-[10px] text-muted-foreground">{lesson.duration}</p>
                        </div>
                      </div>
                      <Play className={`w-4 h-4 shrink-0 ${isActive ? 'fill-brand text-brand' : 'text-muted-foreground'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* My Enrolled Courses List */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <h3 className="text-base font-bold font-serif border-b border-border pb-3">
                My Unlocked Masterclasses
              </h3>

              <div className="space-y-3">
                {Object.values(UNLOCKED_COURSES_DATA).map(c => {
                  const isUnlocked = unlockedCourseIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (isUnlocked) {
                          setActiveCourse(c);
                          setActiveLesson(c.lessons[0]);
                        }
                      }}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        activeCourse.id === c.id
                          ? 'border-brand bg-brand/5 shadow-md'
                          : 'border-border bg-muted/20 hover:border-brand/40'
                      }`}
                    >
                      <div className="relative h-14 w-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        <Image src={c.image} alt={c.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-foreground line-clamp-1">{c.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{c.instructor}</span>
                          {isUnlocked ? (
                            <span className="text-emerald-500 font-bold flex items-center gap-1"><Unlock className="w-3 h-3" /> Unlocked</span>
                          ) : (
                            <span className="text-amber-500 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorLabPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading Student Portal...</div>}>
      <CreatorLabContent />
    </Suspense>
  );
}
