import base64

from api.models import File, Keyword, Offer
from api.pagination import StandardPagination
from api.serializers.serializers import OfferSerializer
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.base import ContentFile

class OfferUpload(APIView):
  permission_classes = (permissions.IsAuthenticated,)

  def post(self, request):
    name = request.data.get('name', None)
    keywords = request.data.get('keywords', None)
    description = request.data.get('description', None)
    files = request.data.get('files', [])

    if name is None or keywords is None or description is None:
      return Response({
        "en": "All required fields must be specified",
        "cz": "Všechna povinná pole musí být specifikována"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(keywords) == 0:
      return Response({
        "en": "At least one keyword must be specified",
        "cz": "Musí být specifikován alespoň jeden klíčový výraz"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(keywords) > 19:
      return Response({
        "en": "Maximum of 20 keywords can be specified",
        "cz": "Maximum 20 klíčových výrazů může být specifikováno"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    of = Offer.objects.create(
      name=name,
      description=description,
      author=self.request.user
    )
    
    for keyword in keywords:
      try:
        kw = Keyword.objects.get(name__iexact=keyword)
      except Keyword.DoesNotExist:
        kw = Keyword.objects.create(name=keyword)
      of.keywords.add(kw)

    for file in files:
      file_content_base64 = file["content"]
      file_content_base64 += '=' * (-len(file_content_base64) % 4)
      file_content = base64.b64decode(file_content_base64)
      file_name = file["name"]
      django_file = ContentFile(file_content, name=file_name)
      File.objects.create(
        name=file["name"],
        file=django_file,
        offer=of
      )

    return Response({
      "id": of.pk
    }, status=status.HTTP_201_CREATED)
  
class OfferList(generics.ListAPIView):
  pagination_class = StandardPagination
  serializer_class = OfferSerializer

  def get_queryset(self):
    offers = Offer.objects.all()

    return offers
  
class OfferDetail(APIView):
  serializer_class = OfferSerializer

  def get(self, request, pk):
    offer = Offer.objects.get(pk=pk)

    return Response(self.serializer_class(offer).data, status=status.HTTP_200_OK)
