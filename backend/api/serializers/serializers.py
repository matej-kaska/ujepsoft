from users.serializers.serializers import UserPublicSerializer
from rest_framework import serializers
from api.models import Offer, Keyword, File

class KeywordSerializer(serializers.ModelSerializer):
  class Meta:
    model = Keyword
    fields = ['name']

class FileSerializer(serializers.ModelSerializer):
  class Meta:
    model = File
    fields = ['name', 'file']

class OfferSerializer(serializers.ModelSerializer):
  keywords = serializers.SerializerMethodField()
  files = FileSerializer(many=True, read_only=True)
  author = UserPublicSerializer(read_only=True)

  class Meta:
    model = Offer
    fields = ['id', 'name', 'description', 'keywords', 'files', 'author']

  def get_keywords(self, obj):
    return [keyword.name for keyword in obj.keywords.all()]