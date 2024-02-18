import json
import os

from api.models import Repo
from api.serializers.serializers import RepoSerializer, RepoFullSerializer, RepoSerializerSmall
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache

from api.services import GitHubAPIService
from api.permissions import IsStaffUser
from utils.issues.new_obj import create_issue
from utils.repos.utils import change_collaborant, check_labels, check_collaborant

class RepoList(generics.ListAPIView):
  permission_classes = (permissions.IsAuthenticated, IsStaffUser)
  serializer_class = RepoSerializer

  def get_queryset(self):
    repos = Repo.objects.all()
    for repo in repos:
      change_collaborant(repo.author, repo.name, repo.pk)
    return Repo.objects.all()
  
class RepoAdd(APIView):
  permission_classes = (permissions.IsAuthenticated, IsStaffUser)

  def post(self, request):
    url = request.data.get('url', None)

    if url is None:
      return Response({
        "en": "Missing URL",
        "cz": "Chybí URL odkaz"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    if not url.startswith('https://github.com/'):
      return Response({
        "en": "Invalid URL",
        "cz": "Špatný URL odkaz"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    user, repo = url.split('/')[-2:]

    is_collaborant = check_collaborant(user, repo)

    if not is_collaborant:
      return Response({
        "en": "You are not a collaborant of this repository",
        "cz": "Nejste collaborantem tohoto repozitáře"
      }, status=status.HTTP_403_FORBIDDEN)
    
    repo_data = GitHubAPIService.get_repo_data(user, repo)

    if repo_data is None:
      return Response({
        "en": "Repository not found",
        "cz": "Repozitář nebyl nalezen"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    repo_issues = GitHubAPIService.get_repo_issues(user, repo)

    if repo_issues is None:
      return Response({
        "en": "Repository not found",
        "cz": "Repozitář nebyl nalezen"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    are_labels_set = check_labels(user, repo)

    if not are_labels_set:
      return Response({
        "en": "You are not a collaborant of this repository",
        "cz": "Nejste collaborantem tohoto repozitáře"
      }, status=status.HTTP_403_FORBIDDEN)
    
    repo_data = GitHubAPIService.get_repo_data(user, repo)

    try:
      new_repo = Repo.objects.get(author=user, name=repo)
    except Repo.DoesNotExist:
      new_repo = Repo.objects.create(
        name=repo_data["name"],
        description=repo_data['description'],
        url=repo_data['html_url'],
        author=repo_data['owner']['login'],
        author_profile_pic=repo_data['owner']['avatar_url'],
        private=repo_data['private'],
      )

    for issue in repo_issues:
      create_issue(issue, new_repo, user, repo)

    repo_serializer = RepoFullSerializer(new_repo)

    cache.set("repo-" + str(new_repo.pk), json.dumps(repo_serializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))
    
    return Response(repo_serializer.data,status=status.HTTP_201_CREATED)
  
class RepoDelete(APIView):
  permission_classes = (permissions.IsAuthenticated, IsStaffUser)

  def delete(self, request, pk):
    
    try:
      repo = Repo.objects.get(pk=pk)
    except Repo.DoesNotExist:
      return Response({
        "en": "Repository not found",
        "cz": "Repozitář nebyl nalezen"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    for issue in repo.issues.all():
      cache.delete("issue-" + str(issue.pk))
    
    repo.delete()

    cache.delete("repo-" + str(pk))

    return Response(status=status.HTTP_204_NO_CONTENT)
  
class RepoListSmall(generics.ListAPIView):
  permission_classes = (permissions.IsAuthenticated,)
  serializer_class = RepoSerializerSmall

  def get_queryset(self):
    return Repo.objects.all()