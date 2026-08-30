# 9. API Reference — Blog

Base path: `/api/v1/blog/`

Public, read-only editorial content — completely unrelated to the
telemetry pipeline. No authentication is required or accepted; only
`published` posts are ever returned (drafts are visible exclusively in
Django admin).

---

## `GET /api/v1/blog/posts/`

Paginated list of published posts (`BlogPostPagination`).

**Auth:** none (`AllowAny`)

**Query parameters**

| Param | Description |
|---|---|
| `search` | matches against `title` or `excerpt` (case-insensitive) |
| `tag` | filter to posts containing this tag |

> Note: `tag` filtering happens in Python after the queryset is evaluated
> (not a database `tags__contains` lookup), so that filtering behaves
> identically on SQLite (dev) and PostgreSQL (prod) — SQLite doesn't
> support that JSON lookup. Apply `search` and `tag` together if needed;
> `tag` must be evaluated last.

**Response `200`**
```json
{
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "f1e2...",
      "title": "Reading a Runoff Risk Alert",
      "slug": "reading-a-runoff-risk-alert",
      "excerpt": "What the hydrology score actually means for your field.",
      "cover_image_url": "https://.../cover.jpg",
      "tags": ["hydrology", "guides"],
      "published_at": "2026-06-02T08:00:00Z",
      "reading_time_minutes": 4
    }
  ]
}
```
*(exact field list per `BlogPostListSerializer` — likely a lighter
projection than the detail serializer; full body is only on detail)*

---

## `GET /api/v1/blog/posts/<slug>/`

Retrieve a single published post's full detail.

**Auth:** none (`AllowAny`)

**Response `200`**
```json
{
  "id": "f1e2...",
  "title": "Reading a Runoff Risk Alert",
  "slug": "reading-a-runoff-risk-alert",
  "excerpt": "What the hydrology score actually means for your field.",
  "content": "Full plain-text article body...\n\n## A subheading\n\nMore text.",
  "cover_image_url": "https://.../cover.jpg",
  "tags": ["hydrology", "guides"],
  "published_at": "2026-06-02T08:00:00Z",
  "reading_time_minutes": 4
}
```

`content` is plain text: paragraphs are separated by a blank line, and
lines beginning with `## ` are rendered as subheadings by the frontend
(no Markdown/HTML parser dependency in the backend).

**Response `404`** if the slug doesn't match a published post (drafts
404 too, for anonymous callers).

---

## `GET /api/v1/blog/tags/`

Distinct tags across all published posts, sorted — used to populate a
filter UI.

**Auth:** none (`AllowAny`)

**Response `200`**
```json
["guides", "hydrology", "livestock", "product-updates"]
```
