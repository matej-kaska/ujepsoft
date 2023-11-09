from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from eduklub.models import (TeachingUnit, Rating, RatingComment)
from api.serializers.eduklub import RatingSerializer, RatingMutationSerializer
from api.pagination import StandardPagination
from api.permissions import IsAuthor

from django.db.models import Q


class RatingAddView(APIView):
    permission_classes = (permissions.IsAuthenticated,)


    def post(self, request, teaching_unit_pk):
        """
        Add rating to teaching unit
        Example data:
        {
            "rating": 5,
            # optional
            "positive_comments": [
                "Test positive comment",
            ],
            # optional
            "negative_comments": [
                "Test negative comment",
            ]
        }
        """
        teaching_unit = generics.get_object_or_404(TeachingUnit, pk=teaching_unit_pk, is_hidden=False)
        rating = Rating.objects.filter(teaching_unit=teaching_unit, author=request.user).first()
        if rating is not None:
            return Response({
                "en": "You have already rated this teaching unit",
                "cz": "Tuto výuku jste již hodnotil/a"
            }, status=status.HTTP_409_CONFLICT)

        data = request.data
        rating = data.get('rating', None)
        positive_comments = data.get('positive_comments', [])
        negative_comments = data.get('negative_comments', [])

        if rating is None or positive_comments is None or negative_comments is None:
            return Response({
                "en": "All fields are required",
                "cz": "Všechna pole jsou povinná"
            }, status=status.HTTP_400_BAD_REQUEST)

        if rating < 1 or rating > 5:
            return Response({
                "en": "Rating must be between 1 and 5",
                "cz": "Hodnocení musí být mezi 1 a 5"
            }, status=status.HTTP_400_BAD_REQUEST)

        rating_obj = Rating.objects.create(rating=rating, teaching_unit=teaching_unit, author=request.user)
        for comment in positive_comments:
            RatingComment.objects.create(rating=rating_obj, text=comment, is_positive=True)

        for comment in negative_comments:
            RatingComment.objects.create(rating=rating_obj, text=comment, is_positive=False)

        serializer = RatingSerializer(rating_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

        
class RatingListView(generics.ListAPIView):
    serializer_class = RatingSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        teaching_unit_pk = self.kwargs['teaching_unit_pk']
        return Rating.objects.filter(teaching_unit__pk=teaching_unit_pk, teaching_unit__is_hidden=False)

class RatingMutationListView(generics.ListAPIView):
    serializer_class = RatingMutationSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        teaching_unit_pk = self.kwargs['teaching_unit_pk']
        ##return Rating.objects.filter(teaching_unit__pk=teaching_unit_pk)
        # teaching unit pk or parent pk
        return Rating.objects.filter(Q(teaching_unit__pk=teaching_unit_pk, teaching_unit__is_hidden=False)
                                      | Q(teaching_unit__parent__pk=teaching_unit_pk, teaching_unit__parent__is_hidden=False))

class RatingDeleteView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAdminUser | IsAuthor,)

    def get_queryset(self):
        return Rating.objects.all()

class RatingUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, pk):
        try:
            rating = Rating.objects.get(pk=pk)
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if rating.author != request.user and not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)

        data = request.data
        rating_new = data.get('rating', None)
        positive_comments = data.get('positive_comments', [])
        negative_comments = data.get('negative_comments', [])


        if rating_new:
            rating.rating = rating_new

        RatingComment.objects.filter(rating=rating, is_positive=True).delete()
        for comment in positive_comments:
            RatingComment.objects.create(rating=rating, text=comment, is_positive=True)

        RatingComment.objects.filter(rating=rating, is_positive=False).delete()
        for comment in negative_comments:
            RatingComment.objects.create(rating=rating, text=comment, is_positive=False)

        if rating_new or positive_comments or negative_comments:
            rating.save()

        serializer = RatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_200_OK)

