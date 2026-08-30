"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ArticleBody from "../../../components/blog/ArticleBody";
import { apiClient } from "../../../libs/api";

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    setIsLoading(true);
    setNotFound(false);

    apiClient
      .get(`/blog/posts/${slug}/`)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center border-t border-line bg-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent"></div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen border-t border-line bg-bg py-20">
        <div className="wrap mx-auto max-w-wrap text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Post not found
          </h1>
          <p className="mt-3 text-ink-soft">
            This article may have been unpublished or moved.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f]"
          >
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-t border-line bg-bg py-10">
      <article className="wrap mx-auto max-w-[760px]">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          ← Back to blog
        </Link>

        {post.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-accent-soft px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
          {post.title}
        </h1>

        <div className="mt-5 flex items-center gap-2 border-b border-line pb-6 font-mono text-sm text-muted">
          <span className="text-ink-soft">{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.reading_time_minutes} min read</span>
        </div>

        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt=""
            className="mt-8 aspect-[16/9] w-full rounded-lg object-cover"
          />
        )}

        <div className="mt-10">
          <ArticleBody content={post.content} />
        </div>
      </article>
    </div>
  );
}
