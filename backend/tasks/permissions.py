from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsTaskOwnerOrAssigned(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
            
        return (
            obj.project.owner == request.user
            or obj.assigned_to == request.user
        )