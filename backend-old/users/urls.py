
from django.urls import path

from . import views


urlpatterns = [
    path("register", views.RegisterView.as_view(), name="users_register"),
    path("auth/token", views.ObtainAuthToken.as_view(), name="users_auth_token"),
]