from django.urls import path
from .views.tests import views as test_views
from .views.ujepsoft import offers as offer_views

urlpatterns = [
    path("redis/", test_views.RedisTestViewSet.as_view(), name="api_tests_redis"),
    path("sql/", test_views.SQLTestViewSet.as_view(), name="api_tests_sql"),
    path("offer", offer_views.OfferUpload.as_view(), name="api_offer"),
    path("offer/list", offer_views.OfferList.as_view(), name="api_offer_list"),
    path("offer/<int:pk>", offer_views.OfferDetail.as_view(), name="api_offer_detail"),
]