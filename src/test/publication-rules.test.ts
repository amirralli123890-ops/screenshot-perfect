import { describe, it, expect } from "vitest";
import { canManage, categoryInfo, slugify } from "@/lib/publication";
import { articleSchema, commentSchema, contactSchema, validateImage } from "@/lib/validation";
import { sanitizeArticle } from "@/lib/content.server";
describe("Editorial permissions", () => {
  it("super admin can manage editor accounts", () =>
    expect(canManage("super_admin", "admins")).toBe(true));
  it("editor cannot manage editor accounts", () =>
    expect(canManage("editor", "admins")).toBe(false));
  it("editor cannot change settings", () => expect(canManage("editor", "settings")).toBe(false));
  it("editor cannot read contact messages", () =>
    expect(canManage("editor", "messages")).toBe(false));
  it("editor can manage articles", () => expect(canManage("editor", "articles")).toBe(true));
  it("editor can manage comments", () => expect(canManage("editor", "comments")).toBe(true));
  it("reader cannot manage articles", () => expect(canManage("reader", "articles")).toBe(false));
});
describe("Publication rules", () => {
  it("creates exactly the six requested categories", () =>
    expect(categoryInfo.map((c) => c.name)).toEqual([
      "Mobile Phones",
      "Gadgets & Accessories",
      "AI & Technology",
      "Reviews & Comparisons",
      "Technology News",
      "Computers & Laptops",
    ]));
  it("uses clean SEO-friendly slugs", () =>
    expect(slugify("Phones & AI: What’s Next?")).toBe("phones-ai-what-s-next"));
  it("only permits draft or published article status", () =>
    expect(articleSchema.shape.status.safeParse("automatic").success).toBe(false));
  it("keeps manually entered USD prices unchanged", () =>
    expect(articleSchema.shape.price_usd.parse(799)).toBe(799));
  it("keeps manually entered PKR prices unchanged", () =>
    expect(articleSchema.shape.price_pkr.parse(223450)).toBe(223450));
  it("allows unknown prices without assuming exchange rates", () =>
    expect(articleSchema.shape.price_pkr.parse(null)).toBeNull());
  it("requires valid guest comment email", () =>
    expect(commentSchema.shape.email.safeParse("not-email").success).toBe(false));
  it("rejects honeypot submissions", () =>
    expect(contactSchema.shape.website.safeParse("spam").success).toBe(false));
  it("rejects executable uploads", () =>
    expect(() => validateImage({ type: "application/javascript", size: 10 })).toThrow());
  it("accepts WebP uploads", () =>
    expect(() => validateImage({ type: "image/webp", size: 100 })).not.toThrow());
  it("enforces the 5 MB image limit", () =>
    expect(() => validateImage({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 })).toThrow());
  it("removes scripts and dangerous links", () =>
    expect(
      sanitizeArticle(
        '<script>alert(1)</script><a href="javascript:alert(1)">Link</a><img src="x" onerror="alert(2)">',
      ),
    ).not.toMatch(/script|onerror|javascript:/));
});
