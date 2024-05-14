from rest_framework import permissions

class IsAuthor(permissions.BasePermission):
  message = 'IsAuthor not allowed'

  def has_object_permission(self, request, view, obj):
    return obj.author == request.user

class IsStaffUser(permissions.BasePermission):

  def has_permission(self, request, view):
    return request.user and request.user.is_staff