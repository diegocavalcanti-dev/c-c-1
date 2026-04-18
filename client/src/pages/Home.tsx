import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Shield,
  TrendingUp,
  Sparkles,
  Clock3,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  const { data: featuredPosts, isLoading: loadingFeatured } =
    trpc.posts.getFeatured.useQuery();
  const { data: latestPosts, isLoading: loadingLatest } =
    trpc.posts.getLatest.useQuery({ limit: 18 });
  const { data: categories } = trpc.categories.list.useQuery();

  const featured = (featuredPosts as any)?.json ?? featuredPosts ?? [];
  const latest = (latestPosts as any)?.json ?? latestPosts ?? [];
  const categoryList = (categories as any)?.json ?? categories ?? [];

  const heroPost = featured[0];
  const sideFeatured = featured.slice(1, 5);
  const latestMain = latest.slice(0, 6);
  const latestGrid = latest.slice(6, 12);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="container relative px-4 py-6 md:py-8 lg:py-10">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Badge className="mb-3 gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                  <Sparkles className="h-3.5 w-3.5" />
                  Cobertura, análise e contexto
                </Badge>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  História militar e geopolítica com visual mais forte e leitura mais fluida
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                  Acompanhe conflitos, tecnologia militar, personagens históricos e análises com uma experiência mais moderna, responsiva e focada no conteúdo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Conteúdo
                  </p>
                  <p className="mt-1 text-2xl font-bold">300+</p>
                  <p className="text-xs text-muted-foreground">artigos publicados</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Foco
                  </p>
                  <p className="mt-1 text-2xl font-bold">Global</p>
                  <p className="text-xs text-muted-foreground">guerras e geopolítica</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur col-span-2 sm:col-span-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Leitura
                  </p>
                  <p className="mt-1 text-2xl font-bold">Mobile</p>
                  <p className="text-xs text-muted-foreground">mais limpa e rápida</p>
                </div>
              </div>
            </div>

            {categoryList.length > 0 && (
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categoryList.slice(0, 8).map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    className="shrink-0"
                  >
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:text-primary"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {loadingFeatured ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <Skeleton className="h-[420px] rounded-3xl lg:col-span-8" />
                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-[96px] rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {heroPost && (
                  <Link href={`/${heroPost.slug}`} className="lg:col-span-8">
                    <article className="group relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                      <img
                        src={heroPost.featuredImage || "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1400&q=80"}
                        alt={heroPost.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                            Matéria em destaque
                          </Badge>

                          {heroPost.publishedAt && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/85 backdrop-blur-sm">
                              <Clock3 className="h-3.5 w-3.5" />
                              {new Date(heroPost.publishedAt).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>

                        <h2 className="max-w-3xl text-2xl font-bold leading-tight text-white md:text-4xl">
                          {heroPost.title}
                        </h2>

                        {heroPost.excerpt && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base line-clamp-3">
                            {heroPost.excerpt}
                          </p>
                        )}

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
                          Ler matéria
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </article>
                  </Link>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
                  {sideFeatured.map((post: any) => (
                    <Link key={post.id} href={`/${post.slug}`}>
                      <article className="group flex h-full gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
                          <img
                            src={post.featuredImage || "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=500&q=80"}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <Badge variant="secondary" className="mb-2 rounded-full text-[10px]">
                            Destaque
                          </Badge>
                          <h3 className="line-clamp-3 text-sm font-semibold leading-5 text-foreground group-hover:text-primary">
                            {post.title}
                          </h3>
                          {post.publishedAt && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="container px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Atualizações recentes
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Últimas publicações</h2>
                </div>

                <Link href="/categoria/materias">
                  <Button variant="ghost" size="sm" className="rounded-full text-primary">
                    Ver todas <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {loadingLatest ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {latestMain.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>

                  <div className="my-8 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm">
                    <AdBanner />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {latestGrid.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </>
              )}

              <div className="mt-8 text-center">
                <Link href="/categoria/materias">
                  <Button variant="outline" className="rounded-full px-8 text-primary border-primary/30 hover:bg-primary/5">
                    Explorar mais artigos
                  </Button>
                </Link>
              </div>
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Sobre o site</h3>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  O Cenas de Combate reúne análises, cronologias, tecnologia militar e perfis históricos em uma experiência mais organizada, visual e confortável para o leitor.
                </p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card to-primary/5 p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Navegação rápida</h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Link href="/categoria/materias">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
                      Ver matérias
                    </div>
                  </Link>
                  <Link href="/categoria/geopolitica">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
                      Geopolítica
                    </div>
                  </Link>
                  <Link href="/categoria/historia-militar">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
                      História militar
                    </div>
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
                <AdBanner />
              </div>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
