import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { submitComment } from "@/lib/publication.functions";
import { commentSchema } from "@/lib/validation";
import type { Database } from "@/integrations/supabase/types";
type Comment = Database["public"]["Tables"]["comments"]["Row"];
export function Comments({ articleId, comments }: { articleId: string; comments: Comment[] }) {
  const [reply, setReply] = useState<Comment | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = useServerFn(submitComment);
  const router = useRouter();
  return (
    <section className="border-t border-border pt-7">
      <h2 className="font-display text-2xl">
        Join the conversation{" "}
        <span className="text-base text-muted-foreground">({comments.length})</span>
      </h2>
      <p className="mt-3 text-xs text-muted-foreground">
        Comment as a guest, or{" "}
        <Link to="/auth" className="text-primary">
          sign in
        </Link>{" "}
        with a reader account. Your email is never published.
      </p>
      <div className="my-6">
        {comments.map((c) => (
          <div key={c.id} className={`border-b border-border py-5 ${c.parent_id ? "ml-7" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong className="text-xs">
                {c.name}
                {c.parent_id && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    reply to {comments.find((p) => p.id === c.parent_id)?.name ?? "comment"}
                  </span>
                )}
              </strong>
              <span className="text-[10px] text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString("en-US")}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-xs leading-7">{c.content}</p>
            <Button
              variant="link"
              className="mt-2 h-auto p-0 text-[10px]"
              onClick={() => setReply(c)}
            >
              Reply
            </Button>
          </div>
        ))}
      </div>
      {reply && (
        <div className="mb-4 flex items-center justify-between text-xs">
          Replying to {reply.name}
          <Button variant="ghost" size="sm" onClick={() => setReply(null)}>
            Cancel reply
          </Button>
        </div>
      )}
      <form
        className="form-grid"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const form = e.currentTarget;
          const f = Object.fromEntries(new FormData(form));
          const parsed = commentSchema.safeParse({
            ...f,
            article_id: articleId,
            parent_id: reply?.id ?? null,
          });
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Check your comment.");
            return;
          }
          setBusy(true);
          try {
            await submit({ data: parsed.data });
            form.reset();
            setReply(null);
            await router.invalidate();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Comment failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-row">
          <label>
            Name
            <input name="name" required maxLength={100} autoComplete="name" />
          </label>
          <label>
            Email (private)
            <input name="email" type="email" required maxLength={255} autoComplete="email" />
          </label>
        </div>
        <label>
          Your comment
          <textarea name="content" required maxLength={2000} rows={4} />
        </label>
        <div className="honeypot" aria-hidden="true">
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <Button disabled={busy} className="w-fit">
          {busy ? "Posting…" : "Post comment"}
        </Button>
      </form>
    </section>
  );
}
