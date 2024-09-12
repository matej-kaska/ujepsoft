from users.serializers.serializers import UserPublicSerializer
from rest_framework import serializers
from api.models import IssueFile, Offer, Keyword, OfferFile, Repo, Issue, Comment

class KeywordSerializer(serializers.ModelSerializer):
  class Meta:
    model = Keyword
    fields = ['name']

class FileSerializer(serializers.ModelSerializer):
  size = serializers.SerializerMethodField()

  class Meta:
    model = OfferFile
    fields = ['id', 'name', 'file', 'file_type', 'size']

  def get_size(self, obj):
    if not obj.file:
      return 0
    return obj.file.size

class FileIssueSerializer(serializers.ModelSerializer):
  size = serializers.SerializerMethodField()

  class Meta:
    model = IssueFile
    fields = ['id', 'name', 'file', 'file_type', 'remote_url', 'size']

  def get_size(self, obj):
    if not obj.file:
      return 0
    return obj.file.size

class OfferSerializer(serializers.ModelSerializer):
  keywords = serializers.SerializerMethodField()
  files = FileSerializer(many=True, read_only=True)
  author = UserPublicSerializer(read_only=True)

  class Meta:
    model = Offer
    fields = ['id', 'name', 'description', 'keywords', 'files', 'author']

  def get_keywords(self, obj):
    return [keyword.name for keyword in obj.keywords.all()]
  
class RepoForIssueSerializer(serializers.ModelSerializer):
  class Meta:
    model = Repo
    fields = ['id', 'name', 'author']
  
class CommentFullSerializer(serializers.ModelSerializer):
  files = FileIssueSerializer(many=True, read_only=True)

  class Meta:
    model = Comment
    fields = ['id', 'number', 'body', 'author','author_profile_pic', 'author_ujepsoft', 'files', 'created_at', 'updated_at']

class IssueSerializer(serializers.ModelSerializer):
  labels = serializers.StringRelatedField(many=True)
  comments = CommentFullSerializer(many=True, read_only=True)
  comments_count = serializers.SerializerMethodField()
  files = FileIssueSerializer(many=True, read_only=True)
  repo = RepoForIssueSerializer()

  class Meta:
    model = Issue
    fields = ['id', 'number', 'title', 'body', 'state', 'labels', 'author', 'author_profile_pic', 'author_ujepsoft', 'files', 'created_at', 'updated_at', 'comments', 'comments_count', 'repo']

  def get_comments_count(self, obj):
    return obj.comments.all().count()
  
class RepoFullSerializer(serializers.ModelSerializer):
  issues = IssueSerializer(many=True, read_only=True)

  class Meta:
    model = Repo
    fields = ['id', 'name', 'description', 'url', 'author', 'author_profile_pic', 'private', 'issues', 'collaborant']

class RepoSerializer(serializers.ModelSerializer):

  class Meta:
    model = Repo
    fields = ['id', 'name', 'description', 'url', 'author', 'author_profile_pic', 'private', 'collaborant']

class RepoSerializerSmall(serializers.ModelSerializer):
  name = serializers.SerializerMethodField()

  class Meta:
    model = Repo
    fields = ['id', 'name']

  def get_name(self, obj):
    return f"{obj.name} ({obj.author})"
