import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Shell } from "@/components/publication/shell";
import { ArticleList, EmptyState, Pagination } from "@/components/publication/feed";
import { feedOptions } from "@/lib/feed-query";
import { pageHead } from "@/lib/publication";
export const Route = createFileRoute("/category/$slug")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => ({
    page: Math.max(1, Number(s["page"]) || 1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, params, deps }) => {
    const data = await context.queryClient.ensureQueryData(feedOptions(params.slug, deps.page));
    if (!data.categories.some((c) => c.slug === params.slug)) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const c = loaderData?.categories.find((c) => c.slug === params.slug);
    return pageHead(
      c?.name ?? "Category Unavailable",
      c?.description ?? "This category is unavailable.",
    );
  },
  component: Page,
});
function Page() {
  const { slug } = Route.useParams();
  const { page = 1 } = Route.useSearch();
  const { data } = useSuspenseQuery(feedOptions(slug, page));
  const c = data.categories.find((c) => c.slug === slug);
  const navigate = useNavigate();
  return (
    <Shell>
      <div className="site-container">
        <div className="page-heading">
          <Link to="/" className="text-xs text-muted-foreground">
            Home
          </Link>
          <h1>{c?.name}</h1>
          <p>{c?.description}</p>
        </div>
        {c?.image_url && (
          <img
            className="mb-8 aspect-video max-h-80 w-full rounded-md object-cover"
            src={c.image_url}
            alt={c.name}
            width={1200}
            height={675}
          />
        )}
        {data.articles.length ? (
          <ArticleList articles={data.articles} categories={data.categories} />
        ) : (
          <EmptyState />
        )}
        <Pagination
          page={page}
          count={data.count}
          onChange={(n) =>
            navigate({ to: "/category/$slug", params: { slug }, search: { page: n } })
          }
        />
      </div>
    </Shell>
  );
}
