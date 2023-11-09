from rest_framework import generics, status
from rest_framework.response import Response

from django.db.models import Count, Avg, Sum

from users.models import User
from eduklub.models import TeachingUnit, Rating


class AuthorStatsRetrieveView(generics.RetrieveAPIView):
    
    def retrieve(self, request, *args, **kwargs):
        # Get user
        try:
            user = User.objects.get(pk=kwargs['pk'])
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Teaching units count
        teaching_units_count = TeachingUnit.objects.filter(author=user, is_hidden=False).count()


        # Teaching units download count
        teaching_units_download_count = TeachingUnit.objects.filter(author=user, is_hidden=False
                                            ).aggregate(Sum('number_of_downloads'))['number_of_downloads__sum']

        # All authors teaching units average rating
        teaching_units_average_rating = TeachingUnit.objects.filter(author=user, is_hidden=False
                                        ).aggregate(Avg('ratings__rating'))['ratings__rating__avg']

        return Response({
            "published_count": teaching_units_count,
            "download_count": teaching_units_download_count,
            "average_rating": teaching_units_average_rating
        }, status=status.HTTP_200_OK)


