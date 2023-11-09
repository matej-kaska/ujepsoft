from django.core.cache import cache
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework import generics

from api.serializers.users import UserSerializer
from users.models import User

class RedisTestViewSet(APIView):

    def get(self, request):
        cache.set('redis_test', 'Redis is connected!', timeout=30)
        return JsonResponse({"message": cache.get('redis_test')})
    
class SQLTestViewSet(APIView):
    serializer_class = UserSerializer

    def get(self, request):
        unit = generics.get_object_or_404(User, pk=1)
        if (unit.email == "ujep@ujep.cz"):
            return JsonResponse({"message": "SQL is connected!"})
        else:
            return JsonResponse({"message": "Error"})