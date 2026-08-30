from django.test import Client, TestCase
from django.urls import reverse

from blog.models import BlogPost


class BlogPostModelTests(TestCase):
    def test_slug_is_derived_from_title_when_blank(self):
        post = BlogPost.objects.create(title="Hello World", content="Body text.")
        self.assertEqual(post.slug, "hello-world")

    def test_duplicate_titles_get_a_unique_slug(self):
        BlogPost.objects.create(title="Hello World", content="Body text.")
        second = BlogPost.objects.create(title="Hello World", content="Other body.")
        self.assertEqual(second.slug, "hello-world-2")

    def test_published_at_set_once_on_first_publish(self):
        post = BlogPost.objects.create(title="Draft", content="...", status=BlogPost.Status.DRAFT)
        self.assertIsNone(post.published_at)

        post.status = BlogPost.Status.PUBLISHED
        post.save()
        first_published_at = post.published_at
        self.assertIsNotNone(first_published_at)

        # Unpublishing and republishing shouldn't move the original date.
        post.status = BlogPost.Status.DRAFT
        post.save()
        post.status = BlogPost.Status.PUBLISHED
        post.save()
        self.assertEqual(post.published_at, first_published_at)

    def test_reading_time_rounds_up_to_nearest_minute(self):
        post = BlogPost.objects.create(title="Short", content=" ".join(["word"] * 250))
        self.assertEqual(post.reading_time_minutes, 2)


class BlogPostAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.published = BlogPost.objects.create(
            title="Published Post",
            content="Visible body.",
            status=BlogPost.Status.PUBLISHED,
            tags=["Climate"],
        )
        self.draft = BlogPost.objects.create(
            title="Draft Post", content="Hidden body.", status=BlogPost.Status.DRAFT
        )

    def test_list_only_returns_published_posts(self):
        response = self.client.get(reverse("blog-post-list"))
        self.assertEqual(response.status_code, 200)
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertIn(self.published.slug, slugs)
        self.assertNotIn(self.draft.slug, slugs)

    def test_detail_returns_full_content_for_published_post(self):
        response = self.client.get(reverse("blog-post-detail", args=[self.published.slug]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["content"], "Visible body.")

    def test_detail_404s_for_draft_post(self):
        response = self.client.get(reverse("blog-post-detail", args=[self.draft.slug]))
        self.assertEqual(response.status_code, 404)

    def test_tag_filter(self):
        response = self.client.get(reverse("blog-post-list"), {"tag": "Climate"})
        slugs = [item["slug"] for item in response.json()["results"]]
        self.assertIn(self.published.slug, slugs)
        self.assertNotIn(self.draft.slug, slugs)

    def test_tags_endpoint_lists_distinct_published_tags(self):
        response = self.client.get(reverse("blog-tag-list"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("Climate", response.json())
