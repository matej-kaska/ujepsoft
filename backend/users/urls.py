from django.urls import path
from . import views

urlpatterns = [
    path("user", views.UserViewSet.as_view(), name="users_detail"),
    path("user/public/<int:pk>", views.UserPublicRetrieveView.as_view(), name="api_users_public_detail"),
    path("register", views.RegisterView.as_view(), name="users_register"),
    path("register/validate", views.RegisterValidatedView.as_view(), name="users_register_validate"),
    path("auth/token", views.ObtainAuthToken.as_view(), name="users_auth_token"),
    path("reset-password", views.PasswordResetView.as_view(), name="users_reset_password"),
    path("request-reset-password", views.RequestPasswordResetView.as_view(), name="users_request_reset_password"),
]