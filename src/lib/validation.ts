import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(0).default(""),
});
export const commentSchema = z.object({
  article_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable().default(null),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  content: z.string().trim().min(1).max(2000),
  website: z.string().max(0).default(""),
});
const safeUrl = z
  .string()
  .refine((v) => !v || (v.startsWith("https://") && !/\s/.test(v)), "Use a valid HTTPS URL");
export const articleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(250),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().max(1000),
  content: z.string().max(500000),
  category_id: z.string().uuid(),
  author_name: z.string().trim().min(1).max(100),
  featured_image: z.string().nullable(),
  image_alt: z.string().max(300),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  trending: z.boolean(),
  seo_title: z.string().max(150),
  meta_description: z.string().max(300),
  focus_keywords: z.string().max(500),
  price_usd: z.number().nonnegative().nullable(),
  price_pkr: z.number().nonnegative().nullable(),
});
export const settingsSchema = z.object({
  instagram_url: safeUrl,
  facebook_url: safeUrl,
  youtube_url: safeUrl,
  tiktok_url: safeUrl,
  x_url: safeUrl,
  pinterest_url: safeUrl,
  canonical_url: safeUrl,
  adsense_client: z.string().regex(/^(ca-pub-\d+)?$/),
  homepage_slot: z.string().regex(/^\d*$/),
  article_slot: z.string().regex(/^\d*$/),
  sidebar_slot: z.string().regex(/^\d*$/),
});
export function validateImage(file: { type: string; size: number }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");
}
