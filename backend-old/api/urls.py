from django.urls import path

from .views.users import views as user_views
from .views.eduklub import views as eduklub_views


urlpatterns = [
    path("users/user", user_views.UserViewSet.as_view({
        "get": "retrieve",
        "put": "partial_update",
        }), name="api_users_detail"),
    path("users/user/public/<int:pk>", user_views.UserPublicRetrieveView.as_view(),
            name="api_users_public_detail"),
    path("users/user/change-password", user_views.UserChangePasswordView.as_view(),
          name="api_users_change_password"),
    path("users/user/change-profile-image", user_views.UserChangeProfileImageView.as_view(),
            name="api_users_change_profile_image"),
    path("users/user/test401", user_views.UserTest401View.as_view(),
            name="api_users_test401"),
    path("users/<int:pk>/delete", user_views.UserDeleteView.as_view(),
         name="api_users_delete"),

    path("authors/<int:pk>/stats", eduklub_views.AuthorStatsRetrieveView.as_view(),
            name="api_eduklub_authors_stats"),

    path("lists", eduklub_views.FavoriteListViewSet.as_view({
        "get": "list",
        "post": "create",
        }), name="api_eduklub_lists"),
    path("lists/<int:pk>", eduklub_views.FavoriteListViewSet.as_view({
        "get": "retrieve",
        "put": "partial_update",
        "delete": "destroy",
        }), name="api_eduklub_lists_detail"),
    path("lists/<int:pk>/list", eduklub_views.FavoriteListTeachingUnitListView.as_view(),
            name="api_eduklub_lists_list"),
    path("lists/<int:favorite_list_id>/teaching-units/<int:teaching_unit_id>",
         eduklub_views.FavoriteListTeachingUnitDestroyView.as_view(),
            name="api_eduklub_lists_teaching_units_delete"),

    path("subjects", eduklub_views.SubjectListView.as_view(), name="api_eduklub_subjects"),

    path("grade-types", eduklub_views.GradeTypeListView.as_view(), name="api_eduklub_grade_types"),

    path("grades", eduklub_views.GradeListView.as_view(), name="api_eduklub_grades"),

    path("languages", eduklub_views.LanguageListView.as_view(), name="api_eduklub_languages"),

    path("curriculums/", eduklub_views.CurriculumViewSet.as_view({
        "get": "list",
        "post": "create",
    }), name="api_eduklub_curriculums"),
    path("curriculums/<int:pk>", eduklub_views.CurriculumViewSet.as_view({
      "get": "retrieve",
      "put": "partial_update",
      "delete": "destroy",
     }), name="api_eduklub_curriculums_detail"),

    path("teaching-units", eduklub_views.TeachingUnitsListView.as_view(), name="api_eduklub_teaching_units"),
    path("teaching-units/recommended", eduklub_views.TeachingUnitsRecommendedListView.as_view(), name="api_eduklub_teaching_units_recommended"),
    path("teaching-units/new", eduklub_views.TeachingUnitAddView.as_view(), name="api_eduklub_teaching_units_add"),
    path("teaching-units/<int:pk>", eduklub_views.TeachingUnitDetailView.as_view(), name="api_eduklub_teaching_units_detail"),
    path("teaching-units/<int:pk>/curriculums", eduklub_views.TeachingUnitCirriculumsListView.as_view(), name="api_eduklub_teaching_units_curriculums"),
    path("teaching-units/<int:teaching_unit_pk>/curriculums/assign", eduklub_views.TeachingUnitCirruculumsAssignView.as_view(),
          name="api_eduklub_teaching_units_curriculums_assign"),
    path("teaching-units/<int:pk>/update/admin", eduklub_views.TeachingUnitsAdminUpdateView.as_view(),
            name="api_eduklub_teaching_units_admin_update"),
    path("teaching-units/<int:teaching_unit_pk>/ratings", eduklub_views.RatingAddView.as_view(),
          name="api_eduklub_teaching_units_rate"),
    path("teaching-units/<int:teaching_unit_pk>/ratings/list", eduklub_views.RatingListView.as_view(),
          name="api_eduklub_teaching_units_ratings_list"),
    path("teaching-units/<int:teaching_unit_pk>/ratings/list/mutations", eduklub_views.RatingMutationListView.as_view(),
          name="api_eduklub_teaching_units_ratings_list_mutations"),
    path("teaching-units/<int:teaching_unit_pk>/alternatives", eduklub_views.TeachingUnitAddAlternatives.as_view(),
          name="api_eduklub_teaching_units_alternatives"),
    path("teaching-units/<int:teaching_unit_pk>/guide-urls", eduklub_views.TeachingUnitAddGuideURL.as_view(),
          name="api_eduklub_teaching_units_guide_urls"),
    path("teaching-units/<int:teaching_unit_pk>/advice-urls", eduklub_views.TeachingUnitAddAdviceURL.as_view(),
          name="api_eduklub_teaching_units_advice_urls"),
    path("teaching-units/<int:teaching_unit_pk>/plan", eduklub_views.TeachingUnitsPlanView.as_view(),
          name="api_eduklub_teaching_units_plan"),
    path("teaching-units/<int:pk>/delete", eduklub_views.TeachingUnitDeleteView.as_view(),
          name="api_eduklub_teaching_units_delete"),
    path("teaching-units/<int:pk>/update", eduklub_views.TeachingUnitUpdateView.as_view(),
          name="api_eduklub_teaching_units_update"),
    path("teaching-units/<int:unit_pk>/alternatives/<int:alternative_pk>/delete", eduklub_views.TeachingUnitDeleteAlternativeView.as_view(),
              name="api_eduklub_teaching_units_alternatives_delete"),
    path("teaching-units/<int:parent_pk>/mutations/new", eduklub_views.TeachingUnitMutationAddView.as_view(),
          name="api_eduklub_teaching_units_mutations_add"),
    path("teaching-units/<int:unit_pk>/guide-urls/<int:guide_url_pk>/delete", eduklub_views.TeachingUnitDeleteGuideURLView.as_view(),
          name="api_eduklub_teaching_units_guide_urls_delete"),
    path("teaching-units/<int:unit_pk>/advice-urls/<int:advice_url_pk>/delete", eduklub_views.TeachingUnitDeleteAdviceURLView.as_view(),
          name="api_eduklub_teaching_units_guide_urls_delete"),

    path("ratings/<int:pk>/delete", eduklub_views.RatingDeleteView.as_view(),
          name="api_eduklub_ratings_delete"),
    path("ratings/<int:pk>/update", eduklub_views.RatingUpdateView.as_view(),
          name="api_eduklub_ratings_update"),
]