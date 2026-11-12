import { createFileRoute } from "@tanstack/react-router";
import { Dashboard, adminOptions } from "@/components/admin/dashboard";
import { pageHead } from "@/lib/publication";
export const Route = createFileRoute("/_authenticated/admin")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOptions),
  head: () => ({
    ...pageHead("Editorial Dashboard", "Private article publishing and publication management."),
    meta: [
      ...pageHead("Editorial Dashboard", "Private editorial dashboard.").meta,
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="site-container py-20">
      <h1 className="font-display text-3xl">Editorial access required.</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Sign in with an authorized editorial account."}
      </p>
    </div>
  ),
});
