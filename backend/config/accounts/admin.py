from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, APIKey,APIRequestLog


class UserAdmin(BaseUserAdmin):
    model = User

    list_display = ("email", "username", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2"),
        }),
    )

    search_fields = ("email", "username")
    ordering = ("email",)


admin.site.register(User, UserAdmin)
admin.site.register(APIKey)
admin.site.register(APIRequestLog)