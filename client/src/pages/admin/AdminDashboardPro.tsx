import { useState, useEffect } from "react";
import AdminLayoutPro from "@/components/admin/AdminLayoutPro";
import MetricCard from "@/components/admin/MetricCard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboardPro() {
  const { data: stats } = trpc.cms.stats.useQuery();
  const { data: posts } = trpc.cms.listPosts.useQuery({ limit: 5, offset: 0 });

  return (
    <AdminLayoutPro title="Dashboard">
      <div className="space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Artigos"
            value={stats?.total || 0}
            icon={<FileText className="w-8 h-8" />}
            color="blue"
            description="Todos os artigos"
          />
          <MetricCard
            title="Publicados"
            value={stats?.published || 0}
            icon={<Eye className="w-8 h-8" />}
            color="green"
            trend={{ value: 12, direction: "up" }}
            description="Este mês"
          />
          <MetricCard
            title="Rascunhos"
            value={stats?.draft || 0}
            icon={<MessageSquare className="w-8 h-8" />}
            color="orange"
            description="Aguardando publicação"
          />
          <MetricCard
            title="Visualizações"
            value={stats?.views || 0}
            icon={<TrendingUp className="w-8 h-8" />}
            color="purple"
            trend={{ value: 8, direction: "up" }}
            description="Últimos 30 dias"
          />
        </div>

        {/* Quick Actions & Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link href="/admin/posts/novo">
                <a className="flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition text-primary font-medium">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Artigo
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
              <Link href="/admin/categorias">
                <a className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition text-blue-600 dark:text-blue-400 font-medium">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Categoria
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
              <Link href="/admin/media">
                <a className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition text-green-600 dark:text-green-400 font-medium">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Upload de Mídia
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Artigos Recentes</h3>
              <Link href="/admin/posts">
                <a className="text-sm text-primary hover:underline">Ver todos</a>
              </Link>
            </div>
            <div className="space-y-3">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border/50 hover:border-border transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 ${
                        post.status === "published"
                          ? "bg-green-500/20 text-green-700 dark:text-green-400"
                          : post.status === "draft"
                          ? "bg-orange-500/20 text-orange-700 dark:text-orange-400"
                          : "bg-gray-500/20 text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {post.status === "published"
                        ? "Publicado"
                        : post.status === "draft"
                        ? "Rascunho"
                        : "Arquivado"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum artigo encontrado
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            <div className="flex gap-4 pb-4 border-b border-border/50">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Novo artigo publicado</p>
                <p className="text-xs text-muted-foreground">
                  "Irã responde plano dos EUA" foi publicado
                </p>
                <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
              </div>
            </div>
            <div className="flex gap-4 pb-4 border-b border-border/50">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Artigo editado</p>
                <p className="text-xs text-muted-foreground">
                  "História da 2ª Guerra" foi atualizado
                </p>
                <p className="text-xs text-muted-foreground mt-1">Há 5 horas</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Imagem enviada</p>
                <p className="text-xs text-muted-foreground">
                  Nova imagem adicionada à mídia
                </p>
                <p className="text-xs text-muted-foreground mt-1">Há 1 dia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutPro>
  );
}
