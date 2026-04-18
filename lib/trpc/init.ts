import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { User } from "@/drizzle/schema";
import { getUserByOpenId } from "@/lib/db";
import superjson from "superjson";

export interface TrpcContext {
  user: User | null;
}

async function createContext(): Promise<TrpcContext> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("manus-session")?.value;

    if (!sessionToken) {
      return { user: null };
    }

    // Decode and verify session token
    // For now, we'll extract the openId from the token
    // In production, properly verify the JWT
    try {
      const decoded = JSON.parse(Buffer.from(sessionToken, "base64").toString());
      const user = await getUserByOpenId(decoded.openId);
      return { user: user || null };
    } catch {
      return { user: null };
    }
  } catch {
    return { user: null };
  }
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

export { createContext };
