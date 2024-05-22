from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, RegistrationCode, PasswordResetCode

class CustomUserAdmin(UserAdmin):
  model = User
  list_display = ('email', 'is_staff', 'is_active', 'is_superuser')
  list_filter = ('email', 'is_staff', 'is_active', 'is_superuser')
  fieldsets = (
    (None, {'fields': ('email', 'password', 'profile_image')}),
    ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser')}),
  )
  add_fieldsets = (
    (None, {'fields': ('email', 'password1', 'password2', 'profile_image')}),
    ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser')}),
  )
  search_fields = ('email',)
  ordering = ('email',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(RegistrationCode)
admin.site.register(PasswordResetCode)