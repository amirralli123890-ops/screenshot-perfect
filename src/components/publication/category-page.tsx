import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { feedOptions } from "@/lib/feed-query";
import { categoryInfo, categoryPath } from "@/lib/publication";
import { Shell } from "./shell";
import { ArticleList, EmptyState, Pagination, Advertisement } from "./feed";
export function CategoryPage({ slug, page }: { slug: string; page: number }) {
  const { data } = useSuspenseQuery(feedOptions(slug, page));
  const c =
    data.categories.find((c) => c.slug === slug) ?? categoryInfo.find((c) => c.slug === slug);
  const navigate = useNavigate();
  return (
    <Shell>
      <div className="site-container">
        <div className="page-heading">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight className="size-3" />
            <span>{c?.name}</span>
          </div>
          <h1>{c?.name ?? "Technology"}</h1>
          <p>{c?.description}</p>
        </div>
        {data.articles.length ? (
          <ArticleList articles={data.articles} categories={data.categories} />
        ) : (
          <EmptyState
            title="A new perspective is on its way."
            description={`Our first ${c?.name.toLowerCase() ?? "technology"} stories are coming soon. Original reporting, useful insights, and a closer look at what's next.`}
          />
        )}
        <Pagination
          page={page}
          count={data.count}
          onChange={(n) => navigate({ to: categoryPath(slug), search: { page: n } })}
        />
        <Advertisement settings={data.settings} />
      </div>
    </Shell>
  );
}
