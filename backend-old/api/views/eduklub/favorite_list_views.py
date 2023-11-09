from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework import generics

from api.serializers.eduklub import FavoriteListSerializer

from eduklub.models import FavoriteList


class FavoriteListViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return FavoriteList.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, is_main=False)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_main:
            return Response({
                "en": "You cannot delete your main list",
                "cz": "Nemůžete smazat váš hlavní seznam"
                }, status=400)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_main and 'name' in request.data:
            return Response({
                "en": "You cannot rename your main list",
                "cz": "Nemůžete přejmenovat váš hlavní seznam"
                }, status=400)

        return super().partial_update(request, *args, **kwargs)


class FavoriteListTeachingUnitDestroyView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return FavoriteList.objects.filter(author=self.request.user)

    def delete(self, request, *args, **kwargs):
        favorite_list_id = kwargs['favorite_list_id']
        teaching_unit_id = kwargs['teaching_unit_id']

        favorite_list = self.get_queryset().get(id=favorite_list_id)
        if favorite_list is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if teaching_unit_id not in favorite_list.teaching_units.all().values_list('id', flat=True):
            return Response(status=status.HTTP_404_NOT_FOUND)

        favorite_list.teaching_units.remove(teaching_unit_id)

        return Response(status=status.HTTP_204_NO_CONTENT)