import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { StickyBottomAd } from "@/components/ad-slot";
import HomePage from "@/pages/home";
import BrowsePage from "@/pages/browse";
import FilmDetailPage from "@/pages/film-detail";
import MovieDetailPage from "@/pages/movie-detail";
import GenrePage from "@/pages/genre";
import AboutPage from "@/pages/about";
import DramaPage from "@/pages/drama";
import DramaDetailPage from "@/pages/drama-detail";
import ChannelPage from "@/pages/channel";
import BlogPage from "@/pages/blog";
import BlogDetailPage from "@/pages/blog-detail";
import AdminPage from "@/pages/admin";
import WatchlistPage from "@/pages/watchlist";
import SearchPage from "@/pages/search";
import PrivacyPage from "@/pages/legal/privacy";
import TermsPage from "@/pages/legal/terms";
import DmcaPage from "@/pages/legal/dmca";
import ContactPage from "@/pages/legal/contact";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/browse" component={BrowsePage} />
      <Route path="/film/:slug" component={FilmDetailPage} />
      <Route path="/movie/:id" component={MovieDetailPage} />
      <Route path="/genre/:slug" component={GenrePage} />
      <Route path="/drama" component={DramaPage} />
      <Route path="/drama/:videoId" component={DramaDetailPage} />
      <Route path="/channel/:channelId" component={ChannelPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogDetailPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/watchlist" component={WatchlistPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/dmca" component={DmcaPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
            data-testid="link-skip-to-content"
          >
            Loncat ke konten utama
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <Router />
            </main>
            <Footer />
          </div>
          <StickyBottomAd />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
