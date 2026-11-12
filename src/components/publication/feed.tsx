import { Link } from "@tanstack/react-router";
import { FileText, ArrowRight, Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  imageSource,
  categoryPath,
  PAGE_SIZE,
  type Article,
  type Category,
  type Settings,
} from "@/lib/publication";
export function EmptyState({
  title = "The next big story starts here.",
  description = "Our editorial team is preparing fresh perspectives on technology. Check back soon for our first stories.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FileText className="size-6" strokeWidth={1.4} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {!compact && (
        <span className="empty-note">
          <Check className="size-3 text-primary" />
          Original stories. Thoughtful insights. Coming soon.
        </span>
      )}
    </div>
  );
}
export function ArticleCard({ article, categories }: { article: Article; categories: Category[] }) {
  const c = categories.find((c) => c.id === article.category_id);
  return (
    <article className="article-card">
      <Link to="/article/$slug" params={{ slug: article.slug }}>
        {article.featured_image && (
          <img
            src={imageSource(article.featured_image)}
            alt={article.image_alt}
            loading="lazy"
            width={640}
            height={400}
          />
        )}
        <div className="article-card-body">
          <span className="eyebrow">{c?.name ?? "Technology"}</span>
          <h3>{article.title}</h3>
          <p>{article.description}</p>
          <div className="article-meta">
            <span>
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </span>
            <span>{article.reading_time} min read</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
export function ArticleList({
  articles,
  categories,
}: {
  articles: Article[];
  categories: Category[];
}) {
  return (
    <div className="article-grid">
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} categories={categories} />
      ))}
    </div>
  );
}
export function SectionHeading({ title, slug }: { title: string; slug?: string }) {
  return (
    <div className="section-heading">
      <h2>
        <span className="heading-bar" />
        {title}
      </h2>
      {slug && (
        <Link to={categoryPath(slug)} search={{ page: 1 }}>
          View all <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}
export function Advertisement({
  settings,
  placement = "homepage",
}: {
  settings?: Settings | null;
  placement?: "homepage" | "article" | "sidebar";
}) {
  const slot = settings?.[`${placement}_slot`];
  return (
    <div className={`advertisement-space ${placement === "sidebar" ? "min-h-40" : ""}`}>
      {settings?.adsense_client && slot ? (
        <ins
          className="adsbygoogle block"
          data-ad-client={settings.adsense_client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <>
          <div>ADVERTISEMENT</div>
          <span>Space reserved for future partners</span>
        </>
      )}
    </div>
  );
}
export function Pagination({
  page,
  count,
  onChange,
}: {
  page: number;
  count: number;
  onChange: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      <span className="text-xs text-muted-foreground">
        {page} / {pages}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
export function SearchEmpty() {
  return (
    <EmptyState
      title="No stories found."
      description="Try a different search, or explore one of our technology categories."
      compact
    />
  );
}
