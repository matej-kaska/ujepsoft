from django.urls import path
from .views.tests import views as test_views
from .views.ujepsoft import offers as offer_views
from .views.ujepsoft import repos as repo_views
from .views.ujepsoft import issues as issue_views

urlpatterns = [
    path("redis/", test_views.RedisTestViewSet.as_view(), name="api_tests_redis"),
    path("sql/", test_views.SQLTestViewSet.as_view(), name="api_tests_sql"),
    path("offer", offer_views.OfferUpload.as_view(), name="api_offer"),
    path("offer/list", offer_views.OfferList.as_view(), name="api_offer_list"),
    path("offer/<int:pk>", offer_views.OfferDetail.as_view(), name="api_offer_detail"),
    path("repo", repo_views.RepoAdd.as_view(), name="api_repo_add"),
    path("repo/list", repo_views.RepoList.as_view(), name="api_repo_list"),
    path("repo/list/small", repo_views.RepoListSmall.as_view(), name="api_repo_list_small"),
    path("repo/<int:pk>", repo_views.RepoDelete.as_view(), name="api_repo_detail"),
    path("issue/list", issue_views.IssuesList.as_view(), name="api_issue_list"),
    path("issue", issue_views.IssueCreate.as_view(), name="api_issue_create"),
]