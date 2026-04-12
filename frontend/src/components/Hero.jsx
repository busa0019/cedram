import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { HOME_COPY } from "../content/homeCopy";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=2200&q=80",
    alt: "Satellite view for disaster monitoring",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2200&q=80",
    alt: "Emergency coordination and data operations",
  },
  {
    src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=2200&q=80",
    alt: "Policy planning and institutional governance",
  },
];

function Hero() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  return (
    <section className="relative -mt-20 flex min-h-[720px] h-[92vh] items-center justify-center overflow-hidden pt-20 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={slides[index].src}
            src={slides[index].src}
            alt={slides[index].alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.08 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1, ease: "easeOut" },
              scale: { duration: 10, ease: "easeOut" },
            }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(238,212,79,0.10),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.72)_0%,rgba(2,6,23,0.58)_32%,rgba(2,6,23,0.76)_72%,rgba(2,6,23,0.90)_100%)]" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm shadow-sm">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {HOME_COPY.hero.badge}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 38 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="mt-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
        >
          {HOME_COPY.hero.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/88 md:text-xl"
        >
          {HOME_COPY.hero.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            to={HOME_COPY.hero.primaryCta.to}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
          >
            {HOME_COPY.hero.primaryCta.label}
          </Link>

          <Link
            to={HOME_COPY.hero.secondaryCta.to}
            className="inline-flex items-center justify-center rounded-xl border border-white/70 px-8 py-3.5 font-semibold text-white transition hover:bg-white hover:text-slate-900"
          >
            {HOME_COPY.hero.secondaryCta.label}
          </Link>
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={[
                "h-2.5 rounded-full transition-all",
                i === index ? "w-10 bg-accent" : "w-2.5 bg-white/35 hover:bg-white/70",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;