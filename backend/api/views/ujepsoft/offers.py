import json
import os

from api.models import File, Keyword, Offer
from api.pagination import StandardPagination
from api.serializers.serializers import OfferSerializer
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

class OfferUpload(APIView):
  permission_classes = (permissions.IsAuthenticated,)
  parser_classes = [MultiPartParser, FormParser]

  def post(self, request):
    name = request.POST.get('name', None)
    keywords = json.loads(request.POST.get('keywords')) if request.POST.get('keywords') else None
    description = request.POST.get('description', None)

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
    
    if len(request.FILES.getlist('files')) > 49:
      return Response({
        "en": "Maximum of 50 files can be uploaded",
        "cz": "Maximum 50 souborů může být nahráno"
      }, status=status.HTTP_400_BAD_REQUEST)

    total_files_size = 0
    
    for uploaded_file in request.FILES.getlist('files'):
      if uploaded_file.size > int(os.environ.get("MAX_FILE_SIZE", 134217728)):
        return Response({
          "en": "File size exceeds the maximum limit of 128 MB",
          "cz": "Velikost souboru překračuje maximální limit 128 MB"
        }, status=status.HTTP_400_BAD_REQUEST)
      total_files_size += uploaded_file.size

    if total_files_size > int(os.environ.get("MAX_TOTAL_FILES_SIZE", 536870912)):
      return Response({
        "en": "Total files size exceeds the maximum limit of 512 MB",
        "cz": "Celková velikost souborů překračuje maximální limit 512 MB"
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

    for uploaded_file in request.FILES.getlist('files'):
      File.objects.create(
        name=uploaded_file.name,
        file=uploaded_file,
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
  parser_classes = [MultiPartParser, FormParser]

  def get_permissions(self):
    if self.request.method in ['PUT', 'DELETE']:
        return [permissions.IsAuthenticated()]
    return []

  def get(self, request, pk):
    offer = Offer.objects.get(pk=pk)

    return Response(self.serializer_class(offer).data, status=status.HTTP_200_OK)
  
  def put(self, request, pk):
    offer = Offer.objects.get(pk=pk)

    if (self.request.user != offer.author and not self.request.user.is_staff):
      return Response({
        "en": "You are not the author of this offer",
        "cz": "Nejste autorem této nabídky"
      }, status=status.HTTP_403_FORBIDDEN)
    
    name = request.POST.get('name', None)
    keywords = json.loads(request.POST.get('keywords')) if request.POST.get('keywords') else None
    description = request.POST.get('description', None)
    existing_files = json.loads(request.POST.get('existingFiles')) if request.POST.get('existingFiles') else []

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

    total_files_size = 0
    
    for uploaded_file in request.FILES.getlist('files'):
      if uploaded_file.size > int(os.environ.get("MAX_FILE_SIZE", 134217728)):
        return Response({
          "en": "File size exceeds the maximum limit of 128 MB",
          "cz": "Velikost souboru překračuje maximální limit 128 MB"
        }, status=status.HTTP_400_BAD_REQUEST)
      total_files_size += uploaded_file.size

    if total_files_size > int(os.environ.get("MAX_TOTAL_FILES_SIZE", 536870912)):
      return Response({
        "en": "Total files size exceeds the maximum limit of 512 MB",
        "cz": "Celková velikost souborů překračuje maximální limit 512 MB"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    offer.name = name
    offer.description = description
    
    for keyword in keywords:
      try:
        kw = Keyword.objects.get(name__iexact=keyword)
      except Keyword.DoesNotExist:
        kw = Keyword.objects.create(name=keyword)
      offer.keywords.add(kw)

    for file in File.objects.filter(offer=offer):
      file_found = False
      for existing_file in existing_files:
        if file.name == existing_file:
          file_found = True
          break
      if not file_found:
        file.delete()

    for uploaded_file in request.FILES.getlist('files'):
      File.objects.create(
        name=uploaded_file.name,
        file=uploaded_file,
        offer=offer
      )

    offer.save()

    return Response(status=status.HTTP_200_OK)

  def delete(self, request, pk):
    offer = Offer.objects.get(pk=pk)

    if (self.request.user != offer.author and not self.request.user.is_staff):
      return Response({
        "en": "You are not the author of this offer",
        "cz": "Nejste autorem této nabídky"
      }, status=status.HTTP_403_FORBIDDEN)
    
    offer.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)