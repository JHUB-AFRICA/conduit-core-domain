from rest_framework import serializers

from .models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    """Summary shape used on the /blog listing page — no full content."""

    author_name = serializers.SerializerMethodField()
    reading_time_minutes = serializers.ReadOnlyField()

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image_url",
            "author_name",
            "tags",
            "reading_time_minutes",
            "published_at",
        ]

    def get_author_name(self, obj):
        return obj.author.username if obj.author else "Conduit Team"


class BlogPostDetailSerializer(BlogPostListSerializer):
    """Full shape used on the /blog/[slug] article page."""

    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ["content", "created_at", "updated_at"]
