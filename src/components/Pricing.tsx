
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Sparkles } from 'lucide-react';
import { FreeCost, FreeType, MonthCost, MonthType, YearCost, YearType } from '@/constants';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: FreeType,
    description: "",
    price: FreeCost,
    features: [
      "Generate 5 Sub-Topics",
      "Lifetime access",
      "Theory & Image Course",
      "Ai Teacher Chat",
    ],
    featured: false,
    cta: "Get Started",
    billing: "forever"
  },
  {
    name: MonthType,
    description: "",
    price: MonthCost,
    features: [
      "Generate 10 Sub-Topics",
      "1 Month Access",
      "Theory & Image Course",
      "Ai Teacher Chat",
      "Course In 23+ Languages",
      "Create Unlimited Course",
      "Video & Theory Course",
    ],
    featured: true,
    cta: "Get Started",
    billing: "monthly"
  },
  {
    name: YearType,
    description: "",
    price: YearCost,
    features: [
      "Generate 10 Sub-Topics",
      "1 Year Access",
      "Theory & Image Course",
      "Ai Teacher Chat",
      "Course In 23+ Languages",
      "Create Unlimited Course",
      "Video & Theory Course",
    ],
    featured: false,
    cta: "Get Started",
    billing: "yearly"
  }
];

const Pricing = () => {
  const pricingRef = useRef<HTMLDivElement>(null);
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

    const titleEl = document.querySelector('.pricing-title');
    if (titleEl) observer.observe(titleEl);

    const switcherEl = document.querySelector('.pricing-switcher');
    if (switcherEl) observer.observe(switcherEl);

    const elements = pricingRef.current?.querySelectorAll('.pricing-card');
    elements?.forEach((el, index) => {
      // Add staggered delay
      el.setAttribute('style', `transition-delay: ${index * 100}ms`);
      observer.observe(el);
    });

    return () => {
      if (titleEl) observer.unobserve(titleEl);
      if (switcherEl) observer.unobserve(switcherEl);
      elements?.forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  const getAdjustedPrice = (basePrice: number) => {
    return basePrice;
  };

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="text-center mb-20 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
            <Sparkles className="h-4 w-4" />
            Pricing built for velocity
          </span>
          <div className="space-y-4">
            <h2 className="pricing-title opacity-0 text-balance font-display text-3xl md:text-4xl lg:text-5xl">
              Transparent plans that scale with your course creation ambitions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Every subscription includes premium AI copilots, localisation, analytics, and collaborative tooling. Upgrade when your content library accelerates.
            </p>
          </div>
        </div>

        <div className="pricing-switcher opacity-0 mx-auto mb-12 flex max-w-xl items-center justify-center gap-3 rounded-full border border-border/70 bg-white/80 px-2 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground backdrop-blur">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary/80">Monthly</span>
          <span className="rounded-full px-3 py-1">&middot;</span>
          <span className="rounded-full px-3 py-1">Annual - save 17%</span>
        </div>

        <div ref={pricingRef} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "pricing-card relative overflow-hidden rounded-3xl border border-border/60 bg-white/80 text-foreground p-10 shadow-soft-xl backdrop-blur transition-all duration-500 dark:bg-card",
                plan.featured && "border-primary/60 shadow-[0_42px_120px_-48px_rgba(37,99,235,0.55)] ring-1 ring-primary/30"
              )}
            >
              {plan.featured && (
                <span className="absolute right-6 top-6 inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                  Most loved
                </span>
              )}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.36em] text-primary/70">{plan.billing}</span>
                  <h3 className="font-display text-3xl text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground">
                    {plan.featured
                      ? "Everything teams need to orchestrate production-ready curriculum across markets."
                      : plan.billing === 'forever'
                        ? "Experiment with the workflow, create lightweight courses, and invite collaborators."
                        : "For fast-moving course teams shipping a new experience every sprint."}
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-foreground">
                    ${getAdjustedPrice(plan.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.billing === 'monthly' ? '/month' : plan.billing === 'yearly' ? '/year' : ''}
                  </span>
                </div>

                <Button
                  onClick={() => navigate('/dashboard')}
                  size="lg"
                  variant={plan.featured ? 'default' : 'outline'}
                  className={cn(
                    'w-full justify-center border-border/70',
                    plan.featured
                      ? 'relative overflow-hidden bg-gradient-to-r from-primary via-primary to-indigo-500 shadow-lg shadow-primary/30 hover:shadow-primary/45'
                      : 'bg-white/70 hover:border-primary/50 hover:bg-white'
                  )}
                >
                  <span className="relative z-10">{plan.cta}</span>
                </Button>

                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
