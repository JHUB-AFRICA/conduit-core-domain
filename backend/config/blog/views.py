from rest_framework import permissions
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BlogPost
from .pagination import BlogPostPagination
from .serializers import BlogPostDetailSerializer, BlogPostListSerializer


class BlogPostListView(ListAPIView):
    """
    GET /api/v1/blog/posts/

    Public — the blog is marketing/editorial content, not a metered API
    surface, so unlike telemetry/alerts this doesn't require a JWT or
    API key. Only published posts are ever returned here; drafts stay
    visible exclusively in /admin/.

    Optional filters: ?tag=<tag>, ?search=<text> (matches title/excerpt).
    """

    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = BlogPostListSerializer
    pagination_class = BlogPostPagination

    def get_queryset(self):
        queryset = BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED).select_related("author")

        search = self.request.query_params.get("search")
        if search:
            from django.db.models import Q

            queryset = queryset.filter(Q(title__icontains=search) | Q(excerpt__icontains=search))

        # Filtered in Python rather than via a `tags__contains` JSON lookup:
        # that lookup isn't supported on SQLite (used in local dev/tests),
        # only on Postgres (production), so this keeps the filter working
        # identically on both backends. Must come last, since it turns the
        # queryset into a plain list.
        tag = self.request.query_params.get("tag")
        if tag:
            queryset = [post for post in queryset if tag in (post.tags or [])]

        return queryset


class BlogPostDetailView(RetrieveAPIView):
    """GET /api/v1/blog/posts/<slug>/ — public, published posts only."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = BlogPostDetailSerializer
    lookup_field = "slug"
    queryset = BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED).select_related("author")


class BlogTagListView(APIView):
    """GET /api/v1/blog/tags/ — distinct tags across published posts, for the filter UI."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tags = set()
        for post_tags in BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED).values_list(
            "tags", flat=True
        ):
            tags.update(post_tags or [])
        return Response(sorted(tags))
