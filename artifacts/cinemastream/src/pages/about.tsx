import { Link } from "wouter";
import { motion } from "framer-motion";
import { Film, Sparkles, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

const values = [
  {
    icon: Film,
    title: "Curated, not crowded",
    text: "Every film is here on purpose. We'd rather show you 20 films worth your evening than 2,000 you'll never click.",
  },
  {
    icon: Eye,
    title: "Designed for the watching",
    text: "Cinematic interfaces, generous typography, and a player that actually feels like a player. The site fades, the film stays.",
  },
  {
    icon: Sparkles,
    title: "Embedded, not hosted",
    text: "Films play directly via YouTube embeds. We don't store anything — we just present it beautifully.",
  },
  {
    icon: Heart,
    title: "Built for film lovers",
    text: "By people who grew up renting tapes, debating directors, and treating the lights-out moment as sacred.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About CinemaStream"
        description="A cinematic streaming destination built for film lovers. Curated, embedded, and designed for the watching."
        pathname="/about"
      />

      <section className="pt-32 sm:pt-44 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-mono uppercase tracking-widest text-primary mb-4">
              About
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl tracking-tight text-balance leading-[1.05]">
              A quieter home for the films you love.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-foreground/80 leading-relaxed text-balance">
              CinemaStream is a small, opinionated streaming destination. We hand-pick films
              that have stayed with us — the ones worth a second viewing, the ones worth
              showing a friend — and we present them the way they deserve to be seen.
              Films stream directly from YouTube. No accounts. No ads in our chrome. No clutter.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="rounded-2xl border border-card-border bg-card p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <v.icon className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-xl tracking-tight mb-2">{v.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12 text-center">
          <Link href="/browse" data-testid="link-about-browse">
            <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold">
              Start watching
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
