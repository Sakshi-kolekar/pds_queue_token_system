from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allow access only to users with role ADMIN."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user.is_authenticated and user.role == "ADMIN")


class IsStaffOrAdmin(BasePermission):
    """Allow access only to users with role ADMIN or STAFF."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user.is_authenticated and user.role in ("ADMIN", "STAFF"))


class IsAdminOrReadOnly(BasePermission):
    """Any logged-in user can read (GET). Only ADMIN can change data."""

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return user.role == "ADMIN"