import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ArticleList from "./pages/ArticleList";
import ArticlePage from "./pages/ArticlePage";
import SearchPage from "./pages/SearchPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostEditor from "./pages/admin/AdminPostEditor";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminImport from "./pages/admin/AdminImport";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/categoria/:slug" component={ArticleList} />
      <Route path="/artigo/:slug" component={ArticlePage} />
      <Route path="/busca" component={SearchPage} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/posts" component={AdminPosts} />
      <Route path="/admin/posts/novo" component={AdminPostEditor} />
      <Route path="/admin/posts/:id/editar" component={AdminPostEditor} />
      <Route path="/admin/categorias" component={AdminCategories} />
      <Route path="/admin/importar" component={AdminImport} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
