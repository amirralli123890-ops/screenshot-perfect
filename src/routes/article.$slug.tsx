import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronRight, Clock, Share2, Copy, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Shell } from "@/components/publication/shell";
import { ArticleList, Advertisement } from "@/components/publication/feed";
import { Comments } from "@/components/publication/comments";
import { Button } from "@/components/ui/button";
import { getArticle } from "@/lib/publication.functions";
import { imageSource, categoryPath, pageHead } from "@/lib/publication";
export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }) => {
    const data = await getArticle({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        ...pageHead("Article Unavailable", "This article is unavailable."),
        meta: [
          ...pageHead("Article Unavailable", "This article is unavailable.").meta,
          { name: "robots", content: "noindex" },
        ],
      };
    const { article: a, settings } = loaderData;
    const title = a.seo_title || a.title;
    const desc = a.meta_description || a.description;
    const image = a.featured_image?.startsWith("https://") ? a.featured_image : undefined;
    const origin = settings?.canonical_url;
    const canonical = origin ? `${origin.replace(/\/$/, "")}/article/${a.slug}` : undefined;
    return {
      meta: [
        { title: `${title} | New Digital World` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: canonical ? [{ rel: "canonical", href: canonical }] : [],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.description,
            datePublished: a.published_at,
            dateModified: a.updated_at,
            author: { "@type": "Person", name: a.author_name },
            publisher: { "@type": "Organization", name: "New Digital World" },
            ...(image ? { image } : {}),
            ...(canonical ? { mainEntityOfPage: canonical } : {}),
          }),
        },
        ...(origin
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: origin },
                    { "@type": "ListItem", position: 2, name: a.title, item: canonical },
                  ],
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: Page,
});
function Page() {
  const data = Route.useLoaderData();
  const a = data.article;
  const c = data.categories.find((c) => c.id === a.category_id);
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      ".article-content h1,.article-content h2,.article-content h3",
    );
    setToc(
      Array.from(nodes).map((n, i) => {
        n.id = `section-${i}`;
        return { id: n.id, text: n.innerText };
      }),
    );
  }, [a.id]);
  return (
    <Shell>
      <div className="site-container">
        <div className="page-heading">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight className="size-3" />
            {c && (
              <>
                <Link to={categoryPath(c.slug)} search={{ page: 1 }}>
                  {c.name}
                </Link>
                <ChevronRight className="size-3" />
              </>
            )}
            <span>{a.title}</span>
          </div>
          <span className="eyebrow mt-7">{c?.name ?? "TECHNOLOGY"}</span>
          <h1 className="max-w-4xl">{a.title}</h1>
          <p>{a.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <span>
              By <strong className="text-foreground">{a.author_name}</strong>
            </span>
            <span>
              {a.published_at
                ? new Date(a.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {a.reading_time} min read
            </span>
          </div>
        </div>
        <div className="home-columns">
          <article>
            {a.featured_image && (
              <img
                className="aspect-video w-full rounded-md object-cover"
                src={imageSource(a.featured_image)}
                alt={a.image_alt}
                width={1200}
                height={675}
                fetchPriority="high"
              />
            )}
            {toc.length > 0 && (
              <nav className="toc" aria-label="Table of contents">
                <h2 className="font-display text-base">In this article</h2>
                {toc.map((t) => (
                  <a key={t.id} href={`#${t.id}`}>
                    {t.text}
                  </a>
                ))}
              </nav>
            )}
            <div
              className="prose article-content"
              dangerouslySetInnerHTML={{ __html: a.content }}
            />
            {(a.price_usd !== null || a.price_pkr !== null) && (
              <div className="mb-6 flex flex-wrap gap-6 border-y border-border py-5">
                {a.price_usd !== null && (
                  <span className="font-display text-lg">
                    ${a.price_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </span>
                )}
                {a.price_pkr !== null && (
                  <span className="font-display text-lg">
                    Rs. {a.price_pkr.toLocaleString("en-US", { minimumFractionDigits: 2 })} PKR
                  </span>
                )}
                <p className="w-full text-[10px] text-muted-foreground">
                  Manually verified at publication. Prices may change.
                </p>
              </div>
            )}
            <Advertisement settings={data.settings} placement="article" />
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="mr-2 text-xs">Share this story</span>
              <Button
                size="icon"
                variant="outline"
                title="Share article"
                aria-label="Share article"
                onClick={async () => {
                  if (navigator.share)
                    await navigator.share({ title: a.title, url: window.location.href });
                  else {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                  }
                }}
              >
                <Share2 />
              </Button>
              <Button
                size="icon"
                variant="outline"
                title="Copy link"
                aria-label="Copy article link"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                }}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent((data.settings?.canonical_url ?? "") + "/article/" + a.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent((data.settings?.canonical_url ?? "") + "/article/" + a.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  X
                </a>
              </Button>
              {copied && (
                <span className="text-xs text-success" role="status">
                  Link copied
                </span>
              )}
            </div>
            <div className="mb-8 flex justify-between gap-6 border-t border-border pt-5">
              {data.previous ? (
                <Link
                  className="max-w-xs text-xs"
                  to="/article/$slug"
                  params={{ slug: data.previous.slug }}
                >
                  <span className="mb-2 flex gap-2 text-muted-foreground">
                    <ArrowLeft className="size-3" />
                    Previous story
                  </span>
                  {data.previous.title}
                </Link>
              ) : (
                <span />
              )}
              {data.next && (
                <Link
                  className="max-w-xs text-right text-xs"
                  to="/article/$slug"
                  params={{ slug: data.next.slug }}
                >
                  <span className="mb-2 flex justify-end gap-2 text-muted-foreground">
                    Next story
                    <ArrowRight className="size-3" />
                  </span>
                  {data.next.title}
                </Link>
              )}
            </div>
            <Comments articleId={a.id} comments={data.comments} />
            {data.related.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-6 font-display text-2xl">More to discover</h2>
                <ArticleList articles={data.related} categories={data.categories} />
              </section>
            )}
            <Advertisement settings={data.settings} placement="article" />
          </article>
          <aside className="home-sidebar">
            <h2 className="sidebar-heading">About the author</h2>
            <p className="mt-5 font-display text-base">{a.author_name}</p>
            <p className="mt-3 text-xs leading-7 text-muted-foreground">
              Exploring the devices, ideas, and innovations that shape our digital world.
            </p>
            <Advertisement settings={data.settings} placement="sidebar" />
          </aside>
        </div>
      </div>
    </Shell>
  );
}
