from django.contrib import admin

from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "author", "published_at", "created_at")
    list_filter = ("status", "tags")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("id", "created_at", "updated_at")
    fields = (
        "title",
        "slug",
        "excerpt",
        "content",
        "cover_image_url",
        "author",
        "tags",
        "status",
        "published_at",
        "id",
        "created_at",
        "updated_at",
    )

    def save_model(self, request, obj, form, change):
        if not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)
