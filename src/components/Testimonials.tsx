
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Star, Sparkles } from 'lucide-react';
import { appName } from '@/constants';

const testimonials = [
  {
    quote: `${appName} saved us months of production time and gave us a creative AI partner that understands our tone. Our flagship certification now ships in two weeks instead of two quarters.`,
    author: "Amelia Crawford",
    title: "Director of Learning Experience, HoloLabs",
    stars: 5
  },
  {
    quote: `The localisation layer is unbelievable. We publish a course to APAC in a single click and the nuance feels native. Engagement has climbed 64% across regions.`,
    author: "Haruto Yamazaki",
    title: "Lead Instructional Designer, NeoTech",
    stars: 5
  },
  {
    quote: `${appName} is the first platform that kept our academics comfortable while moving at startup speed. Faculty collaborate live with AI to iterate on curriculum in real time.`,
    author: "Prof. Danielle Singh",
    title: "Dean of Digital Programs, Horizon University",
    stars: 5
  },
  {
    quote: "Every cohort receives adaptive micro-coaching from the inline AI mentor. Completion is up, drop-off has halved, and learners rave about the personalised nudges.",
    author: "Joel Martinez",
    title: "Head of Enablement, VectorOS",
    stars: 4
  }
];

const Testimonials = () => {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
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
    
    const titleEl = document.querySelector('.testimonials-title');
    if (titleEl) observer.observe(titleEl);
    
    const elements = testimonialsRef.current?.querySelectorAll('.testimonial-item');
    elements?.forEach((el, index) => {
      // Add staggered delay
      el.setAttribute('style', `transition-delay: ${index * 100}ms`);
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
    <section id="testimonials" className="relative overflow-hidden py-24 md:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="text-center mb-20 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
            <Sparkles className="h-4 w-4" />
            Loved by learning leaders
          </span>
          <div className="space-y-4">
            <h2 className="testimonials-title opacity-0 text-balance font-display text-3xl md:text-4xl lg:text-5xl">
              Why high-velocity teams standardise on {appName}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              CourseMind is the intelligent layer trusted by universities and unicorns to build curriculum faster, deliver globally, and delight learners.
            </p>
          </div>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <article className="group relative overflow-hidden rounded-3xl border border-border/70 bg-white/80 text-foreground p-10 shadow-[0_42px_120px_-48px_rgba(15,23,42,0.55)] backdrop-blur dark:bg-card">
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/15 blur-[120px] opacity-80" />
            <div className="relative flex flex-wrap items-center gap-2 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="relative mt-6 text-2xl font-medium text-foreground">
              “CourseMind is the creative director, producer, and pedagogy expert our team never had. The output rivals agencies that quote six figures.”
            </blockquote>
            <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Sofia Marin</p>
                <p>Chief Learning Architect, Polygon Labs</p>
              </div>
              <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
                84% time saved per launch
              </span>
            </div>
          </article>

          <div className="grid gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <article
                key={testimonial.author}
                className="testimonial-item relative overflow-hidden rounded-2xl border border-border/60 bg-white/75 p-8 text-foreground shadow-soft-xl backdrop-blur transition-transform duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_32px_80px_-45px_rgba(37,99,235,0.4)] dark:border-border/70 dark:bg-card/90"
              >
                <div className="flex items-center gap-3 text-primary">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="mt-5 text-base text-muted-foreground">
                  “{testimonial.quote}”
                </blockquote>
                <div className="mt-6 text-sm">
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-muted-foreground">{testimonial.title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div ref={testimonialsRef} className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/70 text-foreground p-6 backdrop-blur dark:border-border/70 dark:bg-card/80">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/70 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/70 to-transparent" />
          <div className="flex animate-[marquee_40s_linear_infinite] gap-4">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={`${testimonial.author}-${index}`}
                className="min-w-[320px] rounded-2xl border border-border/40 bg-primary/5 px-5 py-4 text-sm text-primary/80 dark:bg-primary/15"
              >
                “{testimonial.quote}”
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/60">
                  {testimonial.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
