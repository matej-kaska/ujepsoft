from utils.issues.utils import get_label_names_by_ids
from users.serializers.serializers import UserPublicSerializer
from rest_framework import serializers
from api.models import IssueFile, Offer, Keyword, OfferFile, Repo, Issue, Comment, ReactionsIssue, ReactionsComment

class KeywordSerializer(serializers.ModelSerializer):
  class Meta:
    model = Keyword
    fields = ['name']

class FileSerializer(serializers.ModelSerializer):
  class Meta:
    model = OfferFile
    fields = ['name', 'file', 'file_type']

class FileIssueSerializer(serializers.ModelSerializer):
  class Meta:
    model = IssueFile
    fields = ['name', 'file', 'file_type', 'remote_url']

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
  reactions = serializers.SerializerMethodField()
  files = FileIssueSerializer(many=True, read_only=True)

  class Meta:
    model = Comment
    fields = ['id', 'number', 'body', 'author','author_profile_pic', 'author_ujepsoft', 'files', 'created_at', 'updated_at', 'reactions']

  def get_reactions(self, obj):
    reactions = ReactionsComment.objects.filter(comment=obj)
    return {reaction.name: reaction.count for reaction in reactions}

# Issue serializer with comments and reactions count
class IssueFullSerializer(serializers.ModelSerializer):
  labels = serializers.SerializerMethodField()
  reactions = serializers.SerializerMethodField()
  comments = CommentFullSerializer(many=True, read_only=True)
  files = FileIssueSerializer(many=True, read_only=True)
  repo = RepoForIssueSerializer()

  class Meta:
    model = Issue
    fields = ['id', 'number', 'title', 'body', 'state', 'labels', 'author', 'author_profile_pic', 'author_ujepsoft', 'files', 'created_at', 'updated_at', 'reactions', 'comments', 'repo']

  def get_labels(self, obj):
    return [label.name for label in obj.labels.all()]

  def get_reactions(self, obj):
    reactions = ReactionsIssue.objects.filter(issue=obj)
    return {reaction.name: reaction.count for reaction in reactions}
  
class RepoFullSerializer(serializers.ModelSerializer):
  issues = IssueFullSerializer(many=True, read_only=True)

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
  
# Issue Serializer without comments
class IssueSerializer(serializers.ModelSerializer):
  labels = serializers.SerializerMethodField()
  repo = RepoForIssueSerializer()
  comments = serializers.SerializerMethodField()
  files = FileIssueSerializer(many=True, read_only=True)

  class Meta:
    model = Issue
    fields = ['id', 'number', 'title', 'body', 'state', 'labels', 'author', 'author_profile_pic', 'author_ujepsoft', 'files', 'created_at', 'updated_at', 'repo', 'comments']

  def get_labels(self, obj):
    if isinstance(obj, dict):
      label_ids = obj.get('labels', [])
      return get_label_names_by_ids(label_ids)
    else:
      return [label.name for label in obj.labels.all()]
  
  def get_comments(self, obj):
    if isinstance(obj, dict):
      return obj.get('comments', 0)
    return len(obj.comments.all())
