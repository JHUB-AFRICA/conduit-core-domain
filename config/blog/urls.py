from django.urls import path

from .views import BlogPostDetailView, BlogPostListView, BlogTagListView

urlpatterns = [
    path("blog/posts/", BlogPostListView.as_view(), name="blog-post-list"),
    path("blog/posts/<slug:slug>/", BlogPostDetailView.as_view(), name="blog-post-detail"),
    path("blog/tags/", BlogTagListView.as_view(), name="blog-tag-list"),
]
