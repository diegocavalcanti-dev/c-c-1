import { useState } from "react";
import AdminLayoutPro from "@/components/admin/AdminLayoutPro";
import AdminTable from "@/components/admin/AdminTable";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Eye, Plus } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminPostsListPro() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const limit = 20;
  const { data: postsData, isLoading } = trpc.cms.listPosts.useQuery({
    limit,
    offset: page * limit,
  });

  const deleteMutation = trpc.cms.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Artigo deletado com sucesso!");
      // Refetch would happen automatically via invalidation
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const posts = postsData || [];
  const filtered = posts.filter((post) => {
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.author?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || !status || post.status === status;
    return matchSearch && matchStatus;
  });

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  return (
    <AdminLayoutPro title="Artigos">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gerenciar Artigos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {posts.length} artigos
            </p>
          </div>
          <Link href="/admin/posts/novo">
            <a>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Artigo
              </Button>
            </a>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por título ou autor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="bg-card border-border"
          />
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-right text-sm text-muted-foreground pt-2">
            Mostrando {filtered.length} de {posts.length}
          </div>
        </div>

        {/* Table */}
        <AdminTable
          columns={[
            {
              key: "title" as const,
              label: "Título",
              width: "40%",
              sortable: true,
              render: (value, row) => (
                <div>
                  <p className="font-medium">{value}</p>
                  <p className="text-xs text-muted-foreground">{row.slug}</p>
                </div>
              ),
            },
            {
              key: "author" as const,
              label: "Autor",
              width: "15%",
              sortable: true,
            },
            {
              key: "status" as const,
              label: "Status",
              width: "12%",
              sortable: true,
              render: (value) => (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    value === "published"
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : value === "draft"
                      ? "bg-orange-500/20 text-orange-700 dark:text-orange-400"
                      : "bg-gray-500/20 text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {value === "published"
                    ? "Publicado"
                    : value === "draft"
                    ? "Rascunho"
                    : "Arquivado"}
                </span>
              ),
            },
            {
              key: "createdAt" as const,
              label: "Data",
              width: "15%",
              sortable: true,
              render: (value) =>
                new Date(value).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
            },
            {
              key: "views" as const,
              label: "Visualizações",
              width: "10%",
              render: (value) => <span className="font-medium">{value || 0}</span>,
            },
          ]}
          data={filtered}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          loading={isLoading}
          rowActions={(row) => (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              <Link href={`/admin/posts/${row.id}/editar`}>
                <a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:bg-blue-500/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </a>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-500/10"
                onClick={() => {
                  if (confirm("Tem certeza que deseja deletar este artigo?")) {
                    deleteMutation.mutate({ id: row.id });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          emptyState={
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum artigo encontrado</p>
              <Link href="/admin/posts/novo">
                <a>
                  <Button size="sm">Criar primeiro artigo</Button>
                </a>
              </Link>
            </div>
          }
        />

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page + 1} de {Math.ceil(posts.length / limit)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(posts.length / limit) - 1}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </AdminLayoutPro>
  );
}
