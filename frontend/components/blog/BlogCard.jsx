import Link from "next/link";

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-ink-soft"
    >
      {post.cover_image_url ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-bg-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-bg-soft" />
      )}

      <div className="flex flex-1 flex-col p-5">
        {post.tags?.length > 0 && (
          <span className="mb-3 inline-block w-fit rounded-sm bg-accent-soft px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-accent">
            {post.tags[0]}
          </span>
        )}

        <h3 className="font-display text-xl font-semibold leading-snug text-ink group-hover:text-accent transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 font-mono text-xs text-muted">
          <span>{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.reading_time_minutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
