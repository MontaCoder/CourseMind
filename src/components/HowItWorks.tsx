
import React, { useEffect, useRef } from 'react';
import { Upload, Cpu, Layout, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: <Upload className="h-5 w-5" />,
    badge: "01. Brief",
    title: "Input the raw intelligence",
    description: "Drop outlines, transcripts, and goals. CourseMind maps the knowledge graph and aligns to your tone, learners, and business outcomes.",
    highlight: "Supports docs, video, LMS exports, and subject matter prompts."
  },
  {
    icon: <Cpu className="h-5 w-5" />,
    badge: "02. Configure",
    title: "Tune modalities & localisation",
    description: "Choose the blend of video, image, theory, labs, quizzes, and pick from 23 languages with inclusive voiceover and subtitle packs.",
    highlight: "Reusable presets keep every program on brand."
  },
  {
    icon: <Layout className="h-5 w-5" />,
    badge: "03. Compose",
    title: "AI cobuilds the experience",
    description: "Watch the storyboard assemble with narrative beats, assessments, reflections, and resources aligned to Bloom's taxonomy.",
    highlight: "Team mode gives reviewers real-time edit access."
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    badge: "04. Launch",
    title: "Publish across every surface",
    description: "Export to your LMS, share a branded microsite, or embed into Notion—complete with analytics, certificates, and learner nudges.",
    highlight: "Syncs with Slack, HubSpot, Workday, and more."
  }
];

const HowItWorks = () => {
  const stepsRef = useRef<HTMLDivElement>(null);

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
    
    const titleEl = document.querySelector('.how-it-works-title');
    if (titleEl) observer.observe(titleEl);
    
    const elements = stepsRef.current?.querySelectorAll('.step-item');
    elements?.forEach((el, index) => {
      // Add staggered delay based on index
      el.setAttribute('style', `transition-delay: ${index * 150}ms`);
      observer.observe(el);
    });
    
    return () => {
      if (titleEl) observer.unobserve(titleEl);
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 md:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="text-center mb-20 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
            <Sparkles className="h-4 w-4" />
            Operating blueprint
          </span>
          <div className="space-y-4">
            <h2 className="how-it-works-title opacity-0 text-balance font-display text-3xl md:text-4xl lg:text-5xl">
              A guided flow that goes from raw content to polished curriculum
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Every stage augments your subject matter expertise with AI, blending automation and editorial control for a premium learner experience.
            </p>
          </div>
        </div>

        <div ref={stepsRef} className="relative">
          <div className="pointer-events-none absolute left-4 top-0 bottom-0 hidden w-px bg-gradient-to-b from-primary/40 via-border to-transparent lg:block" />

          <div className="space-y-10">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={cn(
                  "step-item relative flex flex-col gap-6 rounded-3xl border border-border/60 bg-white/75 p-8 text-foreground shadow-soft-xl backdrop-blur transition-all duration-500",
                  "lg:flex-row lg:items-center lg:gap-12",
                  "hover:border-primary/50 hover:shadow-[0_32px_80px_-45px_rgba(37,99,235,0.4)]",
                  "dark:border-border/70 dark:bg-card/85"
                )}
              >
                <div className="absolute -left-8 top-8 hidden h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold lg:flex">
                  {index + 1}
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <div className="space-y-3">
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                      {step.badge}
                    </span>
                    <h3 className="font-display text-2xl text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-base md:text-lg">{step.description}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5/60 p-6 text-sm text-primary/80 lg:w-[320px] dark:bg-primary/15/60">
                  {step.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
