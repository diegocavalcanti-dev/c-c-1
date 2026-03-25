import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Shield, TrendingUp } from "lucide-react";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  const { data: featuredPosts, isLoading: loadingFeatured } =
    trpc.posts.getFeatured.useQuery();
  const { data: latestPosts, isLoading: loadingLatest } =
    trpc.posts.getLatest.useQuery({ limit: 18 });
  const { data: categories } = trpc.categories.list.useQuery();

  const featured = (featuredPosts as any)?.json ?? featuredPosts ?? [];
  const latest = (latestPosts as any)?.json ?? latestPosts ?? [];

  const heroPost = featured[0];
  const gridPosts = featured.slice(1, 5);
  const sidebarPosts = latest.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-6">
          {loadingFeatured ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Skeleton className="lg:col-span-2 aspect-video rounded-lg" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main hero post */}
              {heroPost && (
                <Link
                  href={`/artigo/${heroPost.slug}`}
                  className="lg:col-span-2"
                >
                  <article className="group cursor-pointer relative overflow-hidden rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={
                          heroPost.featuredImage ||
                          "https://images.unsplash.com/photo-1580130732478-4e339fb33746?w=1200&q=80"
                        }
                        alt={heroPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1580130732478-4e339fb33746?w=1200&q=80";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <Badge className="mb-2 bg-primary text-primary-foreground text-xs">
                        Destaque
                      </Badge>
                      <h1 className="text-xl md:text-2xl font-bold text-white leading-snug group-hover:text-primary transition-colors">
                        {heroPost.title}
                      </h1>
                      {heroPost.excerpt && (
                        <p className="text-sm text-white/80 mt-1 line-clamp-2">
                          {heroPost.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-white/60 mt-2">
                        {heroPost.publishedAt
                          ? new Date(heroPost.publishedAt).toLocaleDateString(
                              "pt-BR"
                            )
                          : ""}
                      </p>
                    </div>
                  </article>
                </Link>
              )}

              {/* Side posts */}
              <div className="flex flex-col gap-3">
                {gridPosts.map((post: any) => (
                  <PostCard key={post.id} post={post} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Categories bar */}
        {/* {categories && categories.length > 0 && (
          <section className="border-y border-border bg-card/50">
            <div className="container py-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-muted-foreground shrink-0 font-medium uppercase tracking-wider">
                  Categorias:
                </span>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/categoria/${cat.slug}`}>
                    <Badge
                      variant="outline"
                      className="shrink-0 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-colors cursor-pointer text-xs"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )} */}

        <section className="container py-4">
          <AdBanner />
        </section>

        {/* Latest articles */}
        <section className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">
                    Últimas Publicações
                  </h2>
                </div>
                <Link href="/categoria/materias">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 text-xs"
                  >
                    Ver todas <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              {loadingLatest ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {latestPosts?.slice(0, 12).map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <Link href="/categoria/materias">
                  <Button
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Carregar mais artigos
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* About */}
              <div className="bg-card border border-border rounded-lg p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Sobre o Site
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cenas de Combate é um portal dedicado à história militar,
                  conflitos mundiais e geopolítica. Mais de 300 artigos sobre
                  guerras, tecnologia militar e personagens históricos.
                </p>
              </div>

              {/* Categories */}
              <div className="bg-card border border-border rounded-lg p-4 mb-5">
                <h3 className="font-semibold text-sm text-foreground mb-3">
                  Categorias
                </h3>
                <div className="space-y-1">
                  {categories?.map(cat => (
                    <Link key={cat.id} href={`/categoria/${cat.slug}`}>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary transition-colors group">
                        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent posts sidebar */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm text-foreground mb-3">
                  Artigos Recentes
                </h3>
                <div className="space-y-1">
                  {sidebarPosts.map((post: any) => (
                    <PostCard key={post.id} post={post} variant="compact" />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
