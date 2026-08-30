import math
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class BlogPost(models.Model):
    """
    An editorial article shown on the public /blog pages. Distinct from
    Alert (system-generated) and IngestionRun (system-generated) records —
    this is content a human writes, so it's a small, admin-authored app
    rather than something driven by the ingestion pipeline.
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=200)
    # Auto-derived from title on save if left blank — see save() below.
    slug = models.SlugField(max_length=220, unique=True, blank=True)

    # Short teaser shown on the /blog listing cards. Kept separate from
    # content so authors can hand-write a good hook instead of relying on
    # a truncated first paragraph.
    excerpt = models.CharField(max_length=300, blank=True, default="")

    # Plain text, paragraphs separated by a blank line. The frontend
    # splits on double newlines to render <p> tags, and optional lines
    # starting with "## " are rendered as subheadings — see
    # components/blog/ArticleBody.jsx. Kept deliberately simple (no
    # markdown/HTML parser dependency) to match the rest of the stack.
    content = models.TextField()

    cover_image_url = models.URLField(max_length=500, blank=True, default="")

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blog_posts",
    )

    tags = models.JSONField(default=list, blank=True)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    # Set automatically the first time a post is saved with
    # status=published (see save()) so ordering/"posted on" dates are
    # stable even if the post is later unpublished and republished.
    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        if self.status == self.Status.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def _unique_slug(self):
        base = slugify(self.title)[:200] or "post"
        slug = base
        suffix = 2
        while BlogPost.objects.exclude(pk=self.pk).filter(slug=slug).exists():
            slug = f"{base}-{suffix}"
            suffix += 1
        return slug

    @property
    def reading_time_minutes(self):
        word_count = len(self.content.split())
        return max(1, math.ceil(word_count / 200))
