from utils.issues.utils import get_label_names_by_ids
from users.serializers.serializers import UserPublicSerializer
from rest_framework import serializers
from api.models import Offer, Keyword, File, Repo, Label, Issue, Comment, ReactionsIssue, ReactionsComment

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
  
class CommentFullSerializer(serializers.ModelSerializer):
  reactions = serializers.SerializerMethodField()

  class Meta:
    model = Comment
    fields = ['id', 'number', 'body', 'author','author_profile_pic', 'created_at', 'updated_at', 'reactions']

  def get_reactions(self, obj):
    reactions = ReactionsComment.objects.filter(comment=obj)
    return {reaction.name: reaction.count for reaction in reactions}

class IssueFullSerializer(serializers.ModelSerializer):
  labels = serializers.SerializerMethodField()
  reactions = serializers.SerializerMethodField()
  comments = CommentFullSerializer(many=True, read_only=True)

  class Meta:
    model = Issue
    fields = ['id', 'number', 'title', 'body', 'state', 'labels', 'author', 'author_profile_pic', 'created_at', 'updated_at', 'reactions', 'comments']

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

class IssueSerializer(serializers.ModelSerializer):
  labels = serializers.SerializerMethodField()
  repo = serializers.SerializerMethodField()
  comments = serializers.SerializerMethodField()

  class Meta:
    model = Issue
    fields = ['id', 'number', 'title', 'body', 'state', 'labels', 'author', 'author_profile_pic', 'created_at', 'updated_at', 'repo', 'comments']

  def get_labels(self, obj):
    if isinstance(obj, dict):
      label_ids = obj.get('labels', [])
      return get_label_names_by_ids(label_ids)
    else:
      return [label.name for label in obj.labels.all()]
    
  def get_repo(self, obj):
    if isinstance(obj, dict):
      return obj.get('repo', None)
    return obj.repo.name if obj.repo else None
  
  def get_comments(self, obj):
    if isinstance(obj, dict):
      return obj.get('comments', 0)
    return len(obj.comments.all())

class IssueCacheSerializer(serializers.ModelSerializer):
  repo = serializers.SerializerMethodField()
  comments = serializers.SerializerMethodField()
  
  class Meta:
    model = Issue
    fields = ['id', 'number', 'title', 'body', 'state', 'labels', 'author', 'author_profile_pic', 'created_at', 'updated_at', 'repo', 'comments']

  def get_repo(self, obj):
    return obj.repo.name if obj.repo else None
  
  def get_comments(self, obj):
    return len(obj.comments.all())
