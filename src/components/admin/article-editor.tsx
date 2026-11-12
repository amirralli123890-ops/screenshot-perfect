import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Save, Send, ArrowLeft, Upload, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { RichEditor, uploadImage } from "./rich-editor";
import { saveArticle } from "@/lib/admin.functions";
import { slugify, type Article, type Category } from "@/lib/publication";
export function ArticleEditor({
  article,
  categories,
  onClose,
  onSaved,
}: {
  article?: Article | undefined;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const blank = {
    title: "",
    slug: "",
    description: "",
    content: "",
    category_id: categories[0]?.id ?? "",
    author_name: "Roxana Digital World",
    featured_image: null as string | null,
    image_alt: "",
    status: "draft" as "draft" | "published",
    featured: false,
    trending: false,
    seo_title: "",
    meta_description: "",
    focus_keywords: "",
    price_usd: null as number | null,
    price_pkr: null as number | null,
  };
  const [values, setValues] = useState({
    ...blank,
    ...article,
    category_id: article?.category_id ?? blank.category_id,
    status: article?.status === "published" ? ("published" as const) : ("draft" as const),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const save = useServerFn(saveArticle);
  function field<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  async function submit(status: "draft" | "published") {
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const saved = await save({ data: { ...values, status } });
      setValues({
        ...saved,
        status: saved.status === "published" ? "published" : "draft",
        category_id: saved.category_id ?? "",
      });
      setSuccess(status === "published" ? "Article published." : "Draft saved.");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            title="Back to articles"
            aria-label="Back to articles"
            onClick={onClose}
          >
            <ArrowLeft />
          </Button>
          <h1>{values.id ? "Edit article" : "New article"}</h1>
        </div>
        <div className="flex gap-2">
          <Button disabled={busy} variant="outline" onClick={() => submit("draft")}>
            <Save />
            Save draft
          </Button>
          <Button disabled={busy} onClick={() => submit("published")}>
            <Send />
            Publish
          </Button>
        </div>
      </div>
      {error && (
        <p className="error-text mb-5" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success-text mb-5" role="status">
          {success}{" "}
          {values.status === "published" && (
            <Link className="underline" to="/article/$slug" params={{ slug: values.slug }}>
              View article <ExternalLink className="inline size-3" />
            </Link>
          )}
        </p>
      )}
      <div className="form-grid">
        <label>
          Article title
          <input
            value={values.title}
            maxLength={250}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                title: e.target.value,
                slug: v.id ? v.slug : slugify(e.target.value),
              }))
            }
            placeholder="Your story starts here"
          />
        </label>
        <div className="form-row">
          <label>
            Article URL
            <input value={values.slug} onChange={(e) => field("slug", e.target.value)} />
          </label>
          <label>
            Category
            <select
              value={values.category_id}
              onChange={(e) => field("category_id", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Description
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => field("description", e.target.value)}
            maxLength={1000}
          />
        </label>
        <div>
          <div className="mb-2 text-xs font-semibold">Article content</div>
          <RichEditor
            content={values.content}
            onChange={(s) => field("content", s)}
            onError={setError}
          />
        </div>
        <div className="form-row">
          <label>
            Featured image
            <input
              value={values.featured_image ?? ""}
              onChange={(e) => field("featured_image", e.target.value || null)}
              placeholder="Image URL or uploaded image path"
            />
            <span className="flex items-center gap-2">
              <Upload className="size-3" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Upload featured image"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    field("featured_image", await uploadImage(f));
                    setSuccess("Featured image uploaded.");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Upload failed.");
                  }
                }}
              />
            </span>
          </label>
          <label>
            Image alt text
            <input
              value={values.image_alt}
              maxLength={300}
              onChange={(e) => field("image_alt", e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Author name
            <input
              value={values.author_name}
              maxLength={100}
              onChange={(e) => field("author_name", e.target.value)}
            />
          </label>
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2">
              <input
                className="w-4"
                type="checkbox"
                checked={values.featured}
                onChange={(e) => field("featured", e.target.checked)}
              />
              Featured story
            </label>
            <label className="flex items-center gap-2">
              <input
                className="w-4"
                type="checkbox"
                checked={values.trending}
                onChange={(e) => field("trending", e.target.checked)}
              />
              Trending story
            </label>
          </div>
        </div>
        <h2 className="mt-3 border-t border-border pt-5 font-display text-lg">
          Search & social metadata
        </h2>
        <label>
          SEO title
          <input
            value={values.seo_title}
            maxLength={150}
            onChange={(e) => field("seo_title", e.target.value)}
          />
        </label>
        <label>
          Meta description
          <textarea
            rows={2}
            value={values.meta_description}
            maxLength={300}
            onChange={(e) => field("meta_description", e.target.value)}
          />
        </label>
        <label>
          Focus keywords
          <input
            value={values.focus_keywords}
            maxLength={500}
            onChange={(e) => field("focus_keywords", e.target.value)}
          />
        </label>
        <h2 className="mt-3 border-t border-border pt-5 font-display text-lg">
          Verified product prices{" "}
          <span className="ml-2 text-xs text-muted-foreground">Optional</span>
        </h2>
        <div className="form-row">
          <label>
            USD ($)
            <input
              type="number"
              step="0.01"
              min={0}
              value={values.price_usd ?? ""}
              onChange={(e) =>
                field("price_usd", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </label>
          <label>
            PKR (Rs.)
            <input
              type="number"
              step="0.01"
              min={0}
              value={values.price_pkr ?? ""}
              onChange={(e) =>
                field("price_pkr", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Enter independently verified prices. No exchange rate conversion is applied.
        </p>
      </div>
    </div>
  );
}
