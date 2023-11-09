from rest_framework import viewsets
from rest_framework import permissions

from api.serializers.eduklub import (CurriculumSerializer)
from eduklub.models import (Curriculum)
from api.permissions import (ReadOnly)


class CurriculumViewSet(viewsets.ModelViewSet):
    model = Curriculum
    serializer_class = CurriculumSerializer
    permission_classes = (ReadOnly | permissions.IsAdminUser,)

    def get_queryset(self):
        return Curriculum.objects.all()