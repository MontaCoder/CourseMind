
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Screenshot from '../res/screenshot.png';

const stats = [
  { value: '14K+', label: 'Creators onboarded' },
  { value: '23', label: 'Languages supported' },
  { value: '2.1M', label: 'Learners engaged' },
];

const Hero = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = textRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => {
      observer.observe(el);
    });

    return () => {
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-36 pb-20 md:pt-40 md:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[10%] w-[42rem] rounded-full bg-primary/10 blur-[140px] opacity-60" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div ref={textRef} className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-10">
            <div className="animate-on-scroll opacity-0 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-4 py-2 text-xs font-medium text-primary shadow-soft-xl backdrop-blur dark:border-primary/30 dark:bg-primary/15 dark:text-primary/90">
              <Sparkles className="h-4 w-4" />
              <span>AI-first course creation workspace</span>
            </div>

            <div className="space-y-6 animate-on-scroll opacity-0">
              <h1 className="text-balance font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
                Craft premium learning experiences in minutes not months
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                CourseMind turns raw ideas into studio-grade courses with narrative structure, multimedia assets, and instant assessments.
                Collaborate with AI experts, switch languages seamlessly, and deliver beautiful learning journeys at scale.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center animate-on-scroll opacity-0">
              <Button
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-indigo-500 px-8 shadow-lg shadow-primary/30 transition hover:shadow-primary/45"
                onClick={() => navigate('/dashboard')}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/15 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Build a course
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border/70 bg-white/70 backdrop-blur transition hover:border-primary/60"
                onClick={() => navigate('/signup')}
              >
                Browse templates
              </Button>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-white/70 p-6 text-foreground shadow-soft-xl backdrop-blur md:flex-row md:items-center animate-on-scroll opacity-0 dark:border-border/70 dark:bg-card/85">
              <div className="flex flex-wrap items-center gap-8 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                {stats.map((stat) => (
                  <div key={stat.label} className="min-w-[120px]">
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent md:h-12 md:w-px" />
              <p className="max-w-[240px] text-sm text-muted-foreground">
                Trusted by learning teams at high-growth startups and global enterprises.
              </p>
            </div>
          </div>

          <div className="relative animate-on-scroll opacity-0">
            <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
            <div className="absolute -bottom-16 -right-20 h-40 w-40 rounded-full bg-accent/25 blur-[120px]" />

            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/40 bg-gradient-to-br from-white via-white to-primary/5 shadow-[0_32px_80px_-32px_rgba(15,23,42,0.6)] dark:border-border/70 dark:from-card dark:via-card/90 dark:to-primary/15">
              <div className="absolute inset-x-10 top-6 grid grid-cols-3 gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 text-xs font-medium uppercase tracking-[0.25em] text-primary/80 dark:border-border/60 dark:bg-card/80 dark:text-primary/90">
                <span className="rounded-xl bg-primary/10 px-3 py-2 text-center">Plan</span>
                <span className="rounded-xl bg-primary/10 px-3 py-2 text-center">Create</span>
                <span className="rounded-xl bg-primary/10 px-3 py-2 text-center">Ship</span>
              </div>
              <div className="relative mt-24 aspect-[5/3] overflow-hidden rounded-t-[2rem]">
                <img
                  src={Screenshot}
                  alt="CourseMind dashboard preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between px-8 py-6 text-foreground">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">In flight</p>
                  <p className="text-lg font-semibold text-foreground">Product Analytics 101</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
                  Deploying...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
;

export default Hero;
