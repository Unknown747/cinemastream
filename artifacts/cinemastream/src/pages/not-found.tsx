import { Link } from "wouter";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found"
        description="The film reel you were looking for isn't here. Head back to the lobby and find something to watch."
        pathname="/404"
      />
      <section className="min-h-[80vh] flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-lg">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8">
            <Film className="h-10 w-10" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-mono uppercase tracking-widest text-primary mb-3">
            Reel not found
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tight mb-5">
            Cut. Print. Reset.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            The page you're looking for must have been left on the cutting room floor.
            Let's get you back to the films.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/" data-testid="link-404-home">
              <Button size="lg" className="rounded-full px-7">
                Back to Home
              </Button>
            </Link>
            <Link href="/browse" data-testid="link-404-browse">
              <Button size="lg" variant="secondary" className="rounded-full px-7">
                Browse Films
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
