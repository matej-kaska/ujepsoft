from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from django.db.models import Avg
from django.db import models
from django.db.models.functions import Coalesce

from api.pagination import StandardPagination

from eduklub.models import (FavoriteList,
                            Subject,
                            GradeType,
                            Grade,
                            Language,
                            TeachingUnit,
                            Rating)
from api.serializers.eduklub import (FavoriteListSerializer,
                                     SubjectSerializer,
                                    GradeTypeSerializer,
                                    GradeSerializer,
                                    LanguageSerializer,
                                    TeachingUnitSerializer)


from .user_views import (AuthorStatsRetrieveView)

from .favorite_list_views import (FavoriteListViewSet,
                                  FavoriteListTeachingUnitDestroyView)

from .rating_views import (RatingAddView,
                           RatingListView,
                           RatingMutationListView,
                           RatingDeleteView,
                           RatingUpdateView)

from .teaching_unit_views import (TeachingUnitAddAdviceURL,
                                  TeachingUnitAddAlternatives,
                                  TeachingUnitAddGuideURL,
                                  TeachingUnitsPlanView,
                                  TeachingUnitsRecommendedListView,
                                  TeachingUnitCirriculumsListView,
                                  TeachingUnitCirruculumsAssignView,
                                  TeachingUnitAddView,
                                  TeachingUnitDeleteView,
                                  TeachingUnitUpdateView,
                                  TeachingUnitDeleteAlternativeView,
                                  TeachingUnitMutationAddView,
                                  TeachingUnitDeleteGuideURLView,
                                  TeachingUnitDeleteAdviceURLView)

from .curriculum_views import (CurriculumViewSet, )

class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        if query is not None:
            return Subject.objects.filter(name__icontains=query)
        return Subject.objects.all()

class GradeTypeListView(generics.ListAPIView):
    serializer_class = GradeTypeSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        if query is not None:
            return GradeType.objects.filter(name__icontains=query)
        return GradeType.objects.all()
    
class GradeListView(generics.ListAPIView):
    serializer_class = GradeSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        grade_type_name = self.request.query_params.get('grade-type-name', None)
        grade_types = self.request.query_params.get('grade-types', None)

        objs = Grade.objects.all()
        if query is not None:
            objs = objs.filter(name__icontains=query)

        if grade_type_name is not None:
            objs = objs.filter(grade_type__name__icontains=grade_type_name)

        if grade_types is not None:
            grade_types = grade_types.split(',')
            # convert to int
            try:
                grade_types = [int(gt) for gt in grade_types]
            except ValueError:
                return objs.none()
            objs = objs.filter(grade_type__pk__in=grade_types)

        return objs
    
class LanguageListView(generics.ListAPIView):
    serializer_class = LanguageSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        if query is not None:
            return Language.objects.filter(name__icontains=query)
        return Language.objects.all()

class TeachingUnitsListView(generics.ListAPIView):
    serializer_class = TeachingUnitSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        grade_types = self.request.query_params.get('grade-types', None)
        grades = self.request.query_params.get('grades', None)
        author = self.request.query_params.get('author', None)
        certificated = self.request.query_params.get('certificated', None)
        language = self.request.query_params.get('language', None)
        subjects = self.request.query_params.get('subjects', None)
        is_mutation = self.request.query_params.get('is-mutation', None)
        rating_class = self.request.query_params.get('rating-class', None)
        order_by = self.request.query_params.get('order-by', None)
        is_recommended = self.request.query_params.get('is-recommended', None)

        objs = TeachingUnit.objects.filter(is_hidden=False)

        if query is not None:
            objs = objs.filter(name__icontains=query)

        if grade_types is not None:
            grade_types = grade_types.split(',')
            # convert to int
            try:
                grade_types = [int(gt) for gt in grade_types]
            except ValueError:
                return objs.none()
            objs = objs.filter(grade__grade_type__pk__in=grade_types)

        if grades is not None:
            grades = grades.split(',')
            # convert to int
            try:
                grades = [int(gt) for gt in grades]
            except ValueError:
                return objs.none()
            objs = objs.filter(grade__pk__in=grades)

        if author is not None:
            try:
                author_id = int(author)
            except ValueError:
                return objs.none()
            objs = objs.filter(author__pk=author_id)

        if certificated is not None:
            try:
                certificated = int(certificated)
                if certificated not in [0, 1]:
                    raise ValueError
                
                certificated = bool(certificated)
            except ValueError:
                return objs.none()
            objs = objs.filter(certificated=certificated)

        if language is not None:
            try:
                language_id = int(language)
            except ValueError:
                return objs.none()
            objs = objs.filter(language__pk=language_id)

        if subjects is not None:
            subjects = subjects.split(',')
            # convert to int
            try:
                subjects = [int(gt) for gt in subjects]
            except ValueError:
                return objs.none()
            objs = objs.filter(subject__pk__in=subjects)

        # is_mutation = 1 -> mutations only
        # is_mutation = 0 -> both mutations and non-mutations
        # is_mutation = None -> only non-mutations
        if is_mutation is not None:
            try:
                is_mutation = int(is_mutation)
                if is_mutation not in [0, 1]:
                    raise ValueError
                
                is_mutation = bool(is_mutation)
            except ValueError:
                return objs.none()
            if is_mutation == 1:
                # mutations only
                objs = objs.filter(parent__isnull=False)
            # both mutations and non-mutations so do nothing
        else:
            # only non-mutations
            objs = objs.filter(parent__isnull=True)

        if is_recommended is not None:
            try:
                is_recommended = int(is_recommended)
                if is_recommended not in [0, 1]:
                    raise ValueError
                
                is_recommended = bool(is_recommended)
            except ValueError:
                return objs.none()
            objs = objs.filter(is_recommended=is_recommended)

        if rating_class is not None:
            if rating_class not in ["5-4", "4-3", "3-2", "2-1"]:
                return objs.none()

            rating_class = rating_class.split('-')
            upper = int(rating_class[0])
            lower = int(rating_class[1])

            avg_rating_subquery = Rating.objects.filter(teaching_unit__pk=models.OuterRef('pk'))\
                                                .values('teaching_unit')\
                                                .annotate(avg_rating=Avg('rating'))\
                                                .values('avg_rating')
            
            objs = objs.annotate(avg_rating=models.Subquery(avg_rating_subquery))\
                          .filter(avg_rating__lte=upper, avg_rating__gte=lower)

        if order_by is not None:
            has_minus = order_by.startswith('-')
            order_by = order_by.replace("-", "")

            if order_by not in ["number_of_lessons", "number_of_downloads", "avg_rating"]:
                return objs.none()

            if order_by == "avg_rating":
                avg_rating_subquery = Rating.objects.filter(teaching_unit__pk=models.OuterRef('pk'))\
                                                    .values('teaching_unit')\
                                                    .annotate(avg_rating=Avg('rating'))\
                                                    .values('avg_rating')
                objs = objs.annotate(avg_rating=Coalesce(models.Subquery(avg_rating_subquery), 0, output_field=models.FloatField()))
                if has_minus:
                    order_by = f"-{order_by}"
                
                objs = objs.order_by(order_by)
            else:
                if has_minus:
                    order_by = f"-{order_by}"
                objs = objs.order_by(order_by)
        else:
            objs = objs.order_by('id')


        return objs

class TeachingUnitDetailView(generics.RetrieveAPIView):
    serializer_class = TeachingUnitSerializer
    queryset = TeachingUnit.objects.filter(is_hidden=False)

class TeachingUnitsAdminUpdateView(generics.UpdateAPIView):
    serializer_class = TeachingUnitSerializer
    queryset = TeachingUnit.objects.all()
    permission_classes = (permissions.IsAdminUser,)

    def update(self, request, *args, **kwargs):
        ALLOWED_TO_FIELDS = ("certificated", "is_recommended")
        for field in request.data:
            if field not in ALLOWED_TO_FIELDS:
                return Response(status=401)
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
      
class FavoriteListTeachingUnitListView(generics.ListAPIView):
    serializer_class = TeachingUnitSerializer
    pagination_class = StandardPagination
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        list_id = self.kwargs['pk']
        try:
            list_id = int(list_id)
        except ValueError:
            return TeachingUnit.objects.none()

        return TeachingUnit.objects.filter(favorite_lists__pk=list_id, favorite_lists__author=self.request.user,
                                             is_hidden=False)

