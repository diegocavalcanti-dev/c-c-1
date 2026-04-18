import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./init";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getPublishedPosts,
  getPostBySlug,
  getPostById,
  getPostCategories,
  incrementViewCount,
  createPost,
  updatePost,
  deletePost,
  getAllPostsAdmin,
  getPostStats,
  bulkInsertCategories,
  bulkInsertPosts,
  createMedia,
  getSetting,
  setSetting,
} from "@/lib/db";
import { storagePut } from "@/lib/storage";
import { nanoid } from "nanoid";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Logout handled by Next.js middleware
      return { success: true } as const;
    }),
  }),

  // ─── Categories ────────────────────────────────────────────────────────────

  categories: router({
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const cat = await getCategoryBySlug(input.slug);
        if (!cat) throw new TRPCError({ code: "NOT_FOUND" });
        return cat;
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createCategory(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateCategory(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ─── Posts (Public) ────────────────────────────────────────────────────────

  posts: router({
    list: publicProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(20),
          categorySlug: z.string().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getPublishedPosts(input);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getPostBySlug(input.slug);
        if (!post || post.status !== "published")
          throw new TRPCError({ code: "NOT_FOUND" });
        const postCats = await getPostCategories(post.id);
        await incrementViewCount(post.id);
        return { ...post, categories: postCats };
      }),

    getFeatured: publicProcedure.query(async () => {
      const result = await getPublishedPosts({ page: 1, limit: 6 });
      return result.posts;
    }),

    getLatest: publicProcedure
      .input(z.object({ limit: z.number().default(12) }))
      .query(async ({ input }) => {
        const result = await getPublishedPosts({ page: 1, limit: input.limit });
        return result.posts;
      }),
  }),

  // ─── CMS (Admin) ───────────────────────────────────────────────────────────

  cms: router({
    stats: adminProcedure.query(async () => {
      const [stats, cats] = await Promise.all([
        getPostStats(),
        getAllCategories(),
      ]);
      return { ...stats, categories: cats.length };
    }),

    listPosts: adminProcedure
      .input(
        z.object({
          page: z.number().default(1),
          limit: z.number().default(20),
          status: z.string().optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getAllPostsAdmin(input);
      }),

    getPost: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        const cats = await getPostCategories(post.id);
        return { ...post, categories: cats };
      }),

    createPost: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          content: z.string(),
          excerpt: z.string().optional(),
          featuredImage: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).default("draft"),
          author: z.string().optional(),
          categoryIds: z.array(z.number()).default([]),
          publishedAt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { categoryIds, publishedAt, ...postData } = input;
        const insertData = {
          ...postData,
          publishedAt: publishedAt
            ? new Date(publishedAt)
            : postData.status === "published"
              ? new Date()
              : undefined,
        };
        const id = await createPost(insertData, categoryIds);
        return { id };
      }),

    updatePost: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          slug: z.string().optional(),
          content: z.string().optional(),
          excerpt: z.string().optional(),
          featuredImage: z.string().optional().nullable(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          author: z.string().optional(),
          categoryIds: z.array(z.number()).optional(),
          publishedAt: z.string().optional().nullable(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, categoryIds, publishedAt, ...postData } = input;

        const existing = await getPostById(id);
        const wasPublished = existing?.status === "published";
        const isNowPublished = postData.status === "published";

        const updateData: any = { ...postData };
        if (publishedAt !== undefined) {
          updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
        }
        if (isNowPublished && !wasPublished && !updateData.publishedAt) {
          updateData.publishedAt = new Date();
        }

        await updatePost(id, updateData, categoryIds);
        return { success: true };
      }),

    deletePost: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePost(input.id);
        return { success: true };
      }),

    uploadImage: adminProcedure
      .input(
        z.object({
          filename: z.string(),
          contentType: z.string(),
          dataBase64: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { filename, contentType, dataBase64 } = input;
        const buffer = Buffer.from(dataBase64, "base64");
        const ext = filename.split(".").pop() || "jpg";
        const key = `cms-uploads/${nanoid()}.${ext}`;
        const { url } = await storagePut(key, buffer, contentType);
        await createMedia({
          s3Key: key,
          s3Url: url,
          filename,
          mimeType: contentType,
          fileSize: buffer.length,
        });
        return { url };
      }),

    listMedia: adminProcedure.query(async () => {
      return [];
    }),

    deleteMedia: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    importWordPress: adminProcedure
      .input(
        z.object({
          categories: z.array(
            z.object({
              name: z.string(),
              slug: z.string(),
              description: z.string().optional(),
            })
          ),
          posts: z.array(
            z.object({
              wpId: z.number().optional().nullable(),
              title: z.string(),
              slug: z.string(),
              content: z.string(),
              excerpt: z.string().optional(),
              featuredImage: z.string().optional().nullable(),
              author: z.string().optional(),
              publishedAt: z.string().optional().nullable(),
              categories: z.array(z.string()),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        await bulkInsertCategories(input.categories);

        const allCats = await getAllCategories();
        const catSlugToId = new Map(allCats.map((c: any) => [c.slug, c.id]));

        const postsToInsert = input.posts.map((p: any) => ({
          wpId: p.wpId ?? undefined,
          title: p.title,
          slug: p.slug,
          content: p.content,
          excerpt: p.excerpt || "",
          featuredImage: p.featuredImage || null,
          author: p.author || "Cenas de Combate",
          status: "published" as const,
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
          categoryIds: p.categories
            .map((s: any) => catSlugToId.get(s))
            .filter(Boolean) as number[],
        }));

        const inserted = await bulkInsertPosts(postsToInsert as any);
        return { inserted, total: input.posts.length };
      }),

    // Settings
    getSetting: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const setting = await getSetting(input.key);
        return setting?.value ?? null;
      }),

    setSetting: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setSetting(input.key, input.value);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
