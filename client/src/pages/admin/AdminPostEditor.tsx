import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Mantido para o resumo
import RichTextEditor from "@/components/RichTextEditor"; // Adicionado
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save, Eye, Upload, X, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 490);
}

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEditing = !!id;
  const postId = id ? parseInt(id) : undefined;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [author, setAuthor] = useState("Cenas de Combate");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: categories } = trpc.categories.list.useQuery();

  const { data: existingPost, isLoading: loadingPost } = trpc.cms.getPost.useQuery(
    { id: postId! },
    { enabled: isEditing && !!postId }
  );

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setContent(existingPost.content);
      setExcerpt(existingPost.excerpt || "");
      setFeaturedImage(existingPost.featuredImage || "");
      setStatus(existingPost.status as any);
      setAuthor(existingPost.author || "Cenas de Combate");
      setSelectedCategoryIds(existingPost.categories?.map(c => c.id) || []);
      setSlugManuallyEdited(true);
    }
  }, [existingPost]);

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const createMutation = trpc.cms.createPost.useMutation({
    onSuccess: (data) => {
      toast.success("Artigo criado com sucesso!");
      utils.cms.listPosts.invalidate();
      utils.cms.stats.invalidate();
      navigate(`/admin/posts/${data.id}/editar`);
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const updateMutation = trpc.cms.updatePost.useMutation({
    onSuccess: () => {
      toast.success("Artigo salvo com sucesso!");
      utils.cms.listPosts.invalidate();
      utils.cms.getPost.invalidate({ id: postId });
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const uploadMutation = trpc.cms.uploadImage.useMutation({
    onSuccess: (data) => {
      setFeaturedImage(data.url);
      toast.success("Imagem enviada com sucesso!");
    },
    onError: () => toast.error("Erro ao enviar imagem."),
  });

  const handleSave = (saveStatus?: "draft" | "published") => {
    const finalStatus = saveStatus || status;
    const data = {
      title, slug, content, excerpt,
      status: finalStatus, author, categoryIds: selectedCategoryIds,
    };
    if (isEditing && postId) {
      updateMutation.mutate({ id: postId, ...data, featuredImage: featuredImage || null });
    } else {
      createMutation.mutate({ ...data, featuredImage: featuredImage || undefined });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande (máx 5MB)"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        await uploadMutation.mutateAsync({
          filename: file.name,
          contentType: file.type,
          dataBase64: base64,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingPost) {
    return (
      <AdminLayout title="Editar Artigo">
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Editar Artigo" : "Novo Artigo"}>
      <div className="max-w-5xl">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="border-border text-sm"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              {previewMode ? "Editar" : "Preview"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="border-border text-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Salvar Rascunho
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              {isSaving ? "Salvando..." : "Publicar"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do artigo..."
                className="text-lg font-semibold bg-card border-border h-12"
              />
            </div>

            {/* Slug */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                placeholder="url-do-artigo"
                className="text-sm bg-card border-border font-mono"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-muted-foreground">Conteúdo</Label>
              </div>
              {previewMode ? (
                <div
                  className="article-content bg-card border border-border rounded-lg p-4 min-h-64"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <RichTextEditor value={content} onChange={setContent} />
              )}
            </div>

            {/* Excerpt */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Resumo</Label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve resumo do artigo..."
                className="h-20 text-sm bg-card border-border resize-none"
              />
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Publicação</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                    <SelectTrigger className="bg-secondary border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Autor</Label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="text-sm bg-secondary border-border"
                  />
                </div>
              </div>
            </div>

            {/* Featured image */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Imagem Destaque</h3>
              {featuredImage && (
                <div className="relative mb-3">
                  <img
                    src={featuredImage}
                    alt="Imagem destaque"
                    className="w-full h-32 object-cover rounded border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70"
                    onClick={() => setFeaturedImage("")}
                  >
                    <X className="w-3 h-3 text-white" />
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Input
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="URL da imagem..."
                  className="text-xs bg-secondary border-border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {uploading ? "Enviando..." : "Upload de Imagem"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Categorias</h3>
              <div className="flex flex-wrap gap-1.5">
                {categories?.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={selectedCategoryIds.includes(cat.id) ? "default" : "outline"}
                    className={`cursor-pointer text-xs transition-colors ${selectedCategoryIds.includes(cat.id)
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                      }`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}