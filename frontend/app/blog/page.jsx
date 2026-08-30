"use client";

import { useCallback, useEffect, useState } from "react";
import BlogCard from "../../components/blog/BlogCard";
import TagFilter from "../../components/blog/TagFilter";
import { apiClient } from "../../libs/api";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (tag) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
      const response = await apiClient.get(`/blog/posts/${query}`);
      setPosts(response.results || []);
      setNextPage(response.next);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError(err.message || "Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeTag);
  }, [activeTag, fetchPosts]);

  useEffect(() => {
    apiClient
      .get("/blog/tags/")
      .then(setTags)
      .catch(() => {});
  }, []);

  const loadMore = async () => {
    if (!nextPage) return;
    setIsLoadingMore(true);
    try {
      // /blog/posts/?page=N is a full URL from DRF pagination — apiClient
      // expects a path relative to API_URL, so strip that prefix back off.
      const url = new URL(nextPage);
      const response = await apiClient.get(`${url.pathname.replace("/api/v1", "")}${url.search}`);
      setPosts((prev) => [...prev, ...(response.results || [])]);
      setNextPage(response.next);
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen border-t border-line bg-bg py-8">
      <div className="wrap mx-auto max-w-wrap">
        <div className="mb-10 max-w-2xl">
          <span className="mb-3 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
            Blog
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
            Notes on weather data, agriculture, and climate resilience
          </h1>
          <p className="mt-3 text-[1.02rem] text-ink-soft">
            Updates from the Conduit team on the platform, the data behind
            it, and how people are putting it to use.
          </p>
        </div>

        {tags.length > 0 && (
          <div className="mb-8">
            <TagFilter tags={tags} activeTag={activeTag} onSelect={setActiveTag} />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent"></div>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="rounded-lg border border-line bg-bg-soft p-12 text-center">
            <p className="text-ink-soft">
              {activeTag
                ? `No posts tagged "${activeTag}" yet.`
                : "No posts published yet — check back soon."}
            </p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {nextPage && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="rounded-md border border-line px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink-soft disabled:opacity-50"
                >
                  {isLoadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
