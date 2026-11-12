import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Shell } from "@/components/publication/shell";
import { ArticleList, Pagination, SearchEmpty, EmptyState } from "@/components/publication/feed";
import { Button } from "@/components/ui/button";
import { feedOptions } from "@/lib/feed-query";
import { pageHead } from "@/lib/publication";
export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string; page?: number } => ({
    q: typeof s["q"] === "string" ? s["q"].slice(0, 150) : "",
    page: Math.max(1, Number(s["page"]) || 1),
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "", page: search.page ?? 1 }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(feedOptions(undefined, deps.page, deps.q)),
  head: () => ({
    ...pageHead("Search", "Find published technology news, reviews, devices, and AI insights."),
    meta: [
      ...pageHead("Search", "Find published technology stories.").meta,
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: Page,
});
function Page() {
  const { q = "", page = 1 } = Route.useSearch();
  const [value, setValue] = useState(q);
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(feedOptions(undefined, page, q));
  return (
    <Shell>
      <div className="site-container">
        <div className="page-heading">
          <span className="eyebrow">EXPLORE THE DIGITAL WORLD</span>
          <h1>Find your next discovery.</h1>
          <form
            className="mt-6 flex max-w-xl gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/search", search: { q: value, page: 1 } });
            }}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Search articles"
              placeholder="Search articles, devices, and ideas…"
              maxLength={150}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Search">
              <Search />
            </Button>
          </form>
        </div>
        {data.articles.length ? (
          <>
            <p className="mb-5 text-xs text-muted-foreground">
              {data.count} {data.count === 1 ? "story" : "stories"}
              {q ? ` for “${q}”` : ""}
            </p>
            <ArticleList articles={data.articles} categories={data.categories} />
          </>
        ) : q ? (
          <SearchEmpty />
        ) : (
          <EmptyState />
        )}
        <Pagination
          page={page}
          count={data.count}
          onChange={(n) => navigate({ to: "/search", search: { q, page: n } })}
        />
      </div>
    </Shell>
  );
}
