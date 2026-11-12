import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/publication/category-page";
import { feedOptions } from "@/lib/feed-query";
import { pageHead } from "@/lib/publication";
export const Route = createFileRoute("/computers-laptops")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => ({
    page: Math.max(1, Number(s["page"]) || 1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(feedOptions("computers-laptops", deps.page)),
  head: ({ loaderData }) =>
    pageHead(
      "Computers & Laptops",
      "Computers, laptops and personal computing news.",
      loaderData?.settings?.canonical_url
        ? `${loaderData.settings.canonical_url.replace(/\/$/, "")}/computers-laptops`
        : undefined,
    ),
  component: Page,
});
function Page() {
  const { page = 1 } = Route.useSearch();
  return <CategoryPage slug="computers-laptops" page={page} />;
}
