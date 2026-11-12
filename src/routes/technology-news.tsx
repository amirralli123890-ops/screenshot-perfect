import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/publication/category-page";
import { feedOptions } from "@/lib/feed-query";
import { pageHead } from "@/lib/publication";
export const Route = createFileRoute("/technology-news")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => ({
    page: Math.max(1, Number(s["page"]) || 1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(feedOptions("technology-news", deps.page)),
  head: ({ loaderData }) =>
    pageHead(
      "Technology News",
      "Original technology news from around the world.",
      loaderData?.settings?.canonical_url
        ? `${loaderData.settings.canonical_url.replace(/\/$/, "")}/technology-news`
        : undefined,
    ),
  component: Page,
});
function Page() {
  const { page = 1 } = Route.useSearch();
  return <CategoryPage slug="technology-news" page={page} />;
}
