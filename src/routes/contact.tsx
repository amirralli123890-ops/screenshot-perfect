import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, ArrowUpRight, Send, CheckCircle2 } from "lucide-react";
import { Shell } from "@/components/publication/shell";
import { Button } from "@/components/ui/button";
import { submitContact } from "@/lib/publication.functions";
import { contactSchema } from "@/lib/validation";
import { pageHead } from "@/lib/publication";
export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead(
      "Contact Us",
      "Send questions, feedback, corrections and story suggestions to the New Digital World editorial team.",
    ),
  component: Page,
});
function Page() {
  const send = useServerFn(submitContact);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  return (
    <Shell>
      <div className="site-container">
        <div className="page-heading">
          <span className="eyebrow">LET’S START A CONVERSATION</span>
          <h1>Contact us.</h1>
          <p>
            A question, a correction, or something worth discovering? We'd love to hear from you.
          </p>
        </div>
        <div className="contact-grid">
          <div>
            <h2 className="font-display text-xl">Good stories start with a conversation.</h2>
            <p className="mt-4 max-w-sm text-xs leading-7 text-muted-foreground">
              Share your thoughts with our editorial team. Every message helps us build a more
              thoughtful digital world.
            </p>
            <a
              href="mailto:munebdeveloper034392@gmail.com"
              className="mt-8 flex items-center gap-3 break-all text-xs text-primary"
            >
              <Mail className="size-5 shrink-0" />
              munebdeveloper034392@gmail.com <ArrowUpRight className="size-3 shrink-0" />
            </a>
            <Link to="/privacy" className="mt-6 inline-block text-[10px] text-muted-foreground">
              How we handle your information <ArrowUpRight className="inline size-3" />
            </Link>
          </div>
          {success ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <CheckCircle2 className="mb-5 size-10 text-success" />
              <h2 className="font-display text-2xl">Message received.</h2>
              <p className="mt-3 text-xs text-muted-foreground">
                Thank you for reaching out to New Digital World.
              </p>
              <Button className="mt-6" variant="outline" onClick={() => setSuccess(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form
              className="form-grid"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                const values = Object.fromEntries(new FormData(e.currentTarget));
                const parsed = contactSchema.safeParse(values);
                if (!parsed.success) {
                  setError(parsed.error.issues[0]?.message ?? "Please check your message.");
                  return;
                }
                setBusy(true);
                try {
                  await send({ data: parsed.data });
                  setSuccess(true);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Could not send your message.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="form-row">
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    maxLength={100}
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    required
                    maxLength={255}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
              </div>
              <label>
                Subject
                <input name="subject" required maxLength={200} placeholder="What’s on your mind?" />
              </label>
              <label>
                Your message
                <textarea
                  name="message"
                  required
                  maxLength={5000}
                  rows={6}
                  placeholder="Tell us a little more…"
                />
              </label>
              <div className="honeypot" aria-hidden="true">
                <input name="website" tabIndex={-1} autoComplete="off" />
              </div>
              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-muted-foreground">
                  Your email address stays private.
                </span>
                <Button type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send message"}
                  <Send />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Shell>
  );
}
