import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { trpc } from "../lib/trpc";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [uploadingImage, setUploadingImage] = useState(false);
  const uploadImage = trpc.cms.uploadImage.useMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sincroniza o conteúdo do editor visual quando o valor externo muda (ex.: ao carregar artigo ou mudar do modo HTML)
  useEffect(() => {
    if (editor && mode === "visual" && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor, mode]);

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImageFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploadingImage(true);
      try {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = (ev.target?.result as string).split(",")[1];
          const result = await uploadImage.mutateAsync({
            filename: file.name,
            contentType: file.type,
            dataBase64: base64,
          });
          editor?.chain().focus().setImage({ src: result.url }).run();
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Falha no upload:", error);
        alert("Erro ao enviar imagem. Tente novamente.");
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Tabs Visual / HTML */}
      <div className="flex border-b border-border bg-muted">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "visual"
            ? "bg-background text-primary border-b-2 border-primary -mb-px"
            : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setMode("visual")}
        >
          Visual
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "html"
            ? "bg-background text-primary border-b-2 border-primary -mb-px"
            : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setMode("html")}
        >
          HTML
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-0">
        {mode === "visual" ? (
          <>
            {/* Toolbar - só aparece no modo visual */}
            <div className="bg-muted border-b border-border p-2 flex flex-wrap gap-1">
              <Button
                size="sm"
                variant={editor?.isActive("bold") ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                title="Negrito (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant={editor?.isActive("italic") ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                title="Itálico (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </Button>

              <div className="w-px bg-border mx-1" />

              <Button
                size="sm"
                variant={editor?.isActive("heading", { level: 2 }) ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Título H2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant={editor?.isActive("heading", { level: 3 }) ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Título H3"
              >
                <Heading3 className="w-4 h-4" />
              </Button>

              <div className="w-px bg-border mx-1" />

              <Button
                size="sm"
                variant={editor?.isActive("bulletList") ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                title="Lista com marcadores"
              >
                <List className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant={editor?.isActive("orderedList") ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                title="Lista numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant={editor?.isActive("blockquote") ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                title="Citação"
              >
                <Quote className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant={editor?.isActive("codeBlock") ? "default" : "outline"}
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                title="Bloco de código"
              >
                <Code className="w-4 h-4" />
              </Button>

              <div className="w-px bg-border mx-1" />

              <Button size="sm" variant="outline" onClick={addLink} title="Adicionar link">
                <LinkIcon className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={addImageFromFile}
                disabled={uploadingImage}
                title="Inserir imagem (upload)"
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              </Button>

              <div className="w-px bg-border mx-1" />

              <Button
                size="sm"
                variant="outline"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                title="Desfazer"
              >
                <Undo2 className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                title="Refazer"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Editor visual */}
            <EditorContent editor={editor} className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-96" />
          </>
        ) : (
          /* Modo HTML: textarea com fonte monoespaçada */
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-96 font-mono text-sm bg-card border-0 rounded-none focus-visible:ring-0"
            placeholder="Conteúdo HTML..."
          />
        )}
      </div>
    </div>
  );
}