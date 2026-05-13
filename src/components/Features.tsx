
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Book, Layers, BarChart, PenLine, RotateCw, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    eyebrow: "Pipeline intelligence",
    title: "AI-orchestrated course generation",
    description: "Blend transcripts, briefs, and raw notes into structured modules with visuals, labs, and comprehension checkpoints in seconds."
  },
  {
    icon: <Book className="h-6 w-6" />,
    eyebrow: "Delivery choice",
    title: "Adaptive modality mixer",
    description: "Ship theory + video or cinematic image-led lessons, auto-tuned to your brand voice, tone, and learner proficiency."
  },
  {
    icon: <PenLine className="h-6 w-6" />,
    eyebrow: "Assessment fabric",
    title: "Evaluations with semantic depth",
    description: "Instantly craft scenario-based quizzes, reflections, and rubrics that measure mastery—not memorisation."
  },
  {
    icon: <Layers className="h-6 w-6" />,
    eyebrow: "Global scale",
    title: "23-language localisation layer",
    description: "Launch inclusive learning journeys with native-quality localisation, cultural nuance, and accessibility baked in."
  },
  {
    icon: <RotateCw className="h-6 w-6" />,
    eyebrow: "Inline support",
    title: "Realtime AI coach",
    description: "Learners unlock a context-aware mentor who explains, summarises, and challenges in the moment of need."
  },
  {
    icon: <BarChart className="h-6 w-6" />,
    eyebrow: "Outcomes",
    title: "Live engagement analytics",
    description: "Visibility into completion, dwell time, and knowledge gaps with alerts piped to Slack or your LMS."
  }
];

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  
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
    
    const elements = featuresRef.current?.querySelectorAll('.feature-item');
    elements?.forEach((el, index) => {
      // Add staggered delay
      el.classList.add(`delay-[${index * 100}ms]`);
      observer.observe(el);
    });
    
    return () => {
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section id="features" className="relative overflow-hidden py-24 md:py-36">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-secondary/40" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="text-center mb-18 md:mb-24 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
            <Sparkles className="h-4 w-4" />
            Signature capabilities
          </span>
          <div className="space-y-4">
            <h2 className="text-balance font-display text-3xl md:text-4xl lg:text-5xl">
              Everything your learning team needs to <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">ship premium courses</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Compose cinematic learning experiences with AI copilots, collaboration-ready workflows, and deep analytics—all inside one surface.
            </p>
          </div>
        </div>

        <div ref={featuresRef} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={cn(
                "feature-item group relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-8 text-foreground shadow-soft-xl transition-transform duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_32px_80px_-42px_rgba(37,99,235,0.45)] backdrop-blur",
                "dark:border-border/70 dark:bg-card/90"
              )}
            >
              <div
                className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: 'radial-gradient(circle at top, hsla(var(--primary-hue, 220), 100%, 62%, 0.12), transparent 65%)' }}
              />
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80 dark:border-primary/30 dark:bg-primary/15 dark:text-primary/90">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90">
                  {feature.icon}
                </span>
                {feature.eyebrow}
              </div>
              <h3 className="mb-3 font-display text-2xl text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
