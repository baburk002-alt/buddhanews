import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import { PublicLayout } from "./components/site/PublicLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Article from "./pages/Article";
import { NotFound } from "./pages/NotFound";

// Keep the front page and story page in the initial bundle for fast reading.
// Everything else is split so the newsroom, charts and secondary pages do not
// delay the first paint for a reader.
const Category = lazy(() => import("./pages/Category"));
const Search = lazy(() => import("./pages/Search"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const TipLine = lazy(() => import("./pages/TipLine"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const EditorialPolicy = lazy(() => import("./pages/EditorialPolicy"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Articles = lazy(() => import("./pages/admin/Articles"));
const ArticleEditor = lazy(() => import("./pages/admin/ArticleEditor"));
const Audit = lazy(() => import("./pages/admin/Audit"));
const Media = lazy(() => import("./pages/admin/Media"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const Subscribers = lazy(() => import("./pages/admin/Subscribers"));
const Settings = lazy(() => import("./pages/admin/Settings"));

function Public({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

function Admin({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

function RouteFallback() {
  return (
    <div className="container-news py-16" aria-busy="true" aria-label="Loading page">
      <div className="skeleton h-5 w-36 rounded" />
      <div className="skeleton mt-4 h-12 w-3/4 rounded" />
      <div className="skeleton mt-8 h-72 w-full rounded-lg" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={() => <Public><Home /></Public>} />
        <Route path="/article/:slug" component={() => <Public><Article /></Public>} />
        <Route path="/category/:key" component={() => <Public><Category /></Public>} />
        <Route path="/search" component={() => <Public><Search /></Public>} />
        <Route path="/about" component={() => <Public><About /></Public>} />
        <Route path="/contact" component={() => <Public><Contact /></Public>} />
        <Route path="/tip-line" component={() => <Public><TipLine /></Public>} />
        <Route path="/privacy" component={() => <Public><Privacy /></Public>} />
        <Route path="/terms" component={() => <Public><Terms /></Public>} />
        <Route path="/editorial-policy" component={() => <Public><EditorialPolicy /></Public>} />

        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard" component={() => <Admin><Dashboard /></Admin>} />
        <Route path="/admin/articles" component={() => <Admin><Articles /></Admin>} />
        <Route path="/admin/articles/new" component={() => <Admin><ArticleEditor /></Admin>} />
        <Route path="/admin/articles/:id" component={() => <Admin><ArticleEditor /></Admin>} />
        <Route path="/admin/audit" component={() => <Admin><Audit /></Admin>} />
        <Route path="/admin/media" component={() => <Admin><Media /></Admin>} />
        <Route path="/admin/messages" component={() => <Admin><Messages /></Admin>} />
        <Route path="/admin/subscribers" component={() => <Admin><Subscribers /></Admin>} />
        <Route path="/admin/settings" component={() => <Admin><Settings /></Admin>} />

        <Route path="/404" component={() => <Public><NotFound /></Public>} />
        <Route component={() => <Public><NotFound /></Public>} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <I18nProvider>
          <TooltipProvider>
            <Toaster position="top-center" />
            <Router />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
