"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.static import serve

def unprotected_serve(request, path):
    media_path = Path(settings.MEDIA_ROOT) / 'offer_files' / path
    return serve(request, path, document_root=str(media_path.parent))

@login_required
def protected_serve(request, path):
    return serve(request, path, document_root=settings.MEDIA_ROOT)

urlpatterns = [
    path("api/test/", lambda req: JsonResponse({"message": "Backend is connected!"})),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("api/users/", include("users.urls")),
    re_path(r'^media/offer_files/(?P<path>.*)$', unprotected_serve, name='unprotected_media'),
    re_path(r'^media/(?P<path>.*)$', protected_serve, name='protected_media'),
]