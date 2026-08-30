from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsReadOnlyOrAdmin(BasePermission):
    """
    Allow:
    - Anyone to READ (GET, HEAD, OPTIONS)
    - ONLY admin users to WRITE (POST, PUT, PATCH, DELETE)
    """

    def has_permission(self, request, view):
        # Read-only requests allowed for everyone
        if request.method in SAFE_METHODS:
            return True

        # Write operations only for admin users
        return request.user and request.user.is_staff