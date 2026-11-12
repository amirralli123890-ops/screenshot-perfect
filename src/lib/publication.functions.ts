import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { contactSchema, commentSchema } from "./validation";
import { PAGE_SIZE } from "./publication";
import { publicClient } from "./public-client.server";
import { sanitizeArticle } from "./content.server";
export const getFeed = createServerFn({ method: "GET" })
  .inputValidator((v) =>
    z
      .object({
        category: z.string().optional(),
        q: z.string().max(150).default(""),
        page: z.number().int().min(1).default(1),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const db = publicClient();
    const [cats, settings] = await Promise.all([
      db.from("categories").select("*").order("sort_order"),
      db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (cats.error) throw new Error("Could not load categories.");
    let query = db
      .from("articles")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (data.category) {
      const cat = cats.data?.find((c) => c.slug === data.category);
      if (cat) query = query.eq("category_id", cat.id);
      else query = query.eq("category_id", "00000000-0000-0000-0000-000000000000");
    }
    if (data.q) {
      const term = data.q.replace(/[%_,()]/g, " ").trim();
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
    const result = await query.range((data.page - 1) * PAGE_SIZE, data.page * PAGE_SIZE - 1);
    if (result.error) throw new Error("Could not load articles.");
    const highlights = await db
      .from("articles")
      .select("*")
      .eq("status", "published")
      .or("featured.eq.true,trending.eq.true")
      .order("published_at", { ascending: false })
      .limit(8);
    return {
      articles: result.data ?? [],
      count: result.count ?? 0,
      categories: cats.data ?? [],
      settings: settings.data,
      highlights: highlights.data ?? [],
    };
  });
export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((v) => z.string().max(200).parse(v))
  .handler(async ({ data }) => {
    const db = publicClient();
    const result = await db
      .from("articles")
      .select("*")
      .eq("slug", data)
      .eq("status", "published")
      .maybeSingle();
    if (result.error) throw new Error("Could not load this article.");
    if (!result.data) return null;
    const article = { ...result.data, content: sanitizeArticle(result.data.content) };
    const [cats, related, comments, settings, previous, next] = await Promise.all([
      db.from("categories").select("*").order("sort_order"),
      db
        .from("articles")
        .select("*")
        .eq("status", "published")
        .eq("category_id", article.category_id ?? "00000000-0000-0000-0000-000000000000")
        .neq("id", article.id)
        .limit(3),
      db.from("comments").select("*").eq("article_id", article.id).order("created_at"),
      db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      db
        .from("articles")
        .select("slug,title")
        .eq("status", "published")
        .lt("published_at", article.published_at ?? "")
        .order("published_at", { ascending: false })
        .limit(1),
      db
        .from("articles")
        .select("slug,title")
        .eq("status", "published")
        .gt("published_at", article.published_at ?? "")
        .order("published_at")
        .limit(1),
    ]);
    return {
      article,
      categories: cats.data ?? [],
      related: related.data ?? [],
      comments: comments.data ?? [],
      settings: settings.data,
      previous: previous.data?.[0],
      next: next.data?.[0],
    };
  });
export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const r = await publicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (r.error) throw r.error;
  return r.data;
});
async function limit(kind: string, email: string, max: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const req = getRequest();
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown";
  for (const identifier of [email.toLowerCase(), ...(ip === "unknown" ? [] : [ip])]) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${kind}:${identifier}`),
    );
    const key = Array.from(new Uint8Array(digest))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
    const r = await supabaseAdmin.rpc("consume_submission_limit", { _key: key, _max: max });
    if (r.error || !r.data) throw new Error("Too many submissions. Please try again in an hour.");
  }
  return supabaseAdmin;
}
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((v) => contactSchema.parse(v))
  .handler(async ({ data }) => {
    const db = await limit("contact", data.email, 3);
    const { website: _, ...values } = data;
    const r = await db.from("contact_messages").insert(values);
    if (r.error) throw new Error("Your message could not be saved. Please try again.");
    return { success: true };
  });
export const submitComment = createServerFn({ method: "POST" })
  .inputValidator((v) => commentSchema.parse(v))
  .handler(async ({ data }) => {
    const pub = publicClient();
    const article = await pub
      .from("articles")
      .select("id")
      .eq("id", data.article_id)
      .eq("status", "published")
      .maybeSingle();
    if (!article.data) throw new Error("This article is not available for comments.");
    if (data.parent_id) {
      const parent = await pub
        .from("comments")
        .select("id")
        .eq("id", data.parent_id)
        .eq("article_id", data.article_id)
        .maybeSingle();
      if (!parent.data) throw new Error("The comment you are replying to is no longer available.");
    }
    const db = await limit("comment", data.email, 10);
    let userId: string | null = null;
    const token = getRequest()
      .headers.get("authorization")
      ?.replace(/^Bearer /, "");
    if (token) {
      const u = await db.auth.getUser(token);
      userId = u.data.user?.id ?? null;
    }
    const result = await db
      .from("comments")
      .insert({
        article_id: data.article_id,
        parent_id: data.parent_id,
        name: data.name,
        content: data.content,
        user_id: userId,
      })
      .select("id")
      .single();
    if (result.error) throw new Error("Your comment could not be saved.");
    const privateResult = await db
      .from("comment_contacts")
      .insert({ comment_id: result.data.id, email: data.email });
    if (privateResult.error) {
      await db.from("comments").delete().eq("id", result.data.id);
      throw new Error("Your comment could not be saved.");
    }
    return { success: true };
  });
