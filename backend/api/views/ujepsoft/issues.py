import json
import os
from datetime import datetime, timezone
from tkinter import Label

from api.models import Issue, Repo
from api.serializers.serializers import IssueCacheSerializer, IssueSerializer
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache

from api.services import GitHubAPIService
from api.pagination import IssuePagination
from utils.issues.new_obj import create_issue, update_issue
from utils.issues.utils import find_issue_by_id, get_datetime

class IssuesList(generics.ListAPIView):
  serializer_class = IssueSerializer
  permission_classes = (permissions.IsAuthenticated,)
  pagination_class = IssuePagination

  def list(self, request, *args, **kwargs):
    issues = Issue.objects.all()
    response = []

    for issue in issues:
      cached_issue = cache.get("issue-" + str(issue.pk))
      if cached_issue:
        response.append(json.loads(cached_issue))
        continue
      else:
        response = []
        break

    if len(response) > 0:
      print("getting issues from cache")
      response = sorted(response, key=lambda x: get_datetime(x["updated_at"]), reverse=True)

      page = self.paginate_queryset(response)
      if page is not None:
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
      
      serializer = self.get_serializer(response, many=True)
      return Response(serializer.data,status=status.HTTP_200_OK)

    fetched_issues = GitHubAPIService.get_all_issues()
    issue_ids = [str(issue.gh_id) for issue in issues]

    for fetched_issue in fetched_issues:

      if str(fetched_issue["id"]) in issue_ids:
        issue_ids.remove(str(fetched_issue["id"]))

      issue = find_issue_by_id(issues, fetched_issue["id"])

      # Getting new issue
      if issue is None:
        new_issue = GitHubAPIService.get_issue(fetched_issue["user"]["login"], fetched_issue["repo"], fetched_issue["number"])

        repo = Repo.objects.get(author=fetched_issue["user"]["login"], name=fetched_issue["repo"])

        create_issue(new_issue, repo, fetched_issue["user"]["login"], fetched_issue["repo"])
        print(f"creating new issue {fetched_issue['number']}")

        issue = Issue.objects.get(gh_id=fetched_issue["id"])

      # Getting updated issue
      if issue and datetime.strptime(fetched_issue["updated_at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc) != issue.updated_at:
        response.append(update_issue(issue.pk, fetched_issue, issue.repo.author, issue.repo.name))
        print(f"updating issue {issue.number}")
        continue

      # Getting issue from database
      issue_serializer = IssueCacheSerializer(issue)
      cache.set("issue-" + str(issue.pk), json.dumps(issue_serializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))
      # TODO: full serializer
      response.append(issue)
      print(f"getting issue {issue.number} from db")

    if len(issue_ids) > 0:
      Issue.objects.filter(gh_id__in=issue_ids).delete()
      print(f"removing issue {issue_ids}")

    response = sorted(response, key=lambda x: get_datetime(x.updated_at), reverse=True)

    page = self.paginate_queryset(response)
    if page is not None:
      serializer = self.get_serializer(page, many=True)
      return self.get_paginated_response(serializer.data)
    
    serializer = self.get_serializer(response, many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)
  
class Issue(APIView):

  def post(self, request):
    name = request.POST.get('name', None)
    repo = request.POST.get('repo', None)
    labels = json.loads(request.POST.get('keywords')) if request.POST.get('keywords') else None
    description = request.POST.get('description', None)

    if name is None or repo is None or labels is None or description is None:
      return Response({
        "en": "All required fields must be specified",
        "cz": "Všechna povinná pole musí být specifikována"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(labels) == 0:
      return Response({
        "en": "At least one keyword must be specified",
        "cz": "Musí být specifikován alespoň jeden klíčový výraz"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(name) < 6 or len(name) > 100:
      return Response({
        "en": "Name must be between 6 and 100 characters long",
        "cz": "Název musí být dlouhý 6 až 100 znaků"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(description) < 32 or len(description) > 8192:
      return Response({
        "en": "Description must be between 32 and 8192 characters long",
        "cz": "Popis musí být dlouhý 32 až 8192 znaků"
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
    
    if not Repo.objects.filter(pk=repo).exists():
      return Response({
        "en": "Repository not found",
        "cz": "Repozitář nebyl nalezen"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    for label in labels:
      if not Label.objects.filter(name=label).exists():
        return Response({
          "en": "Label " + label + " does not exist",
          "cz": "Označení " + label + " neexistuje"
        }, status=status.HTTP_400_BAD_REQUEST)
      
    # Format description (Add files and author)
    
    # Create offer on Github
    # Wait for response
    # Create issue in database from response
    # Add issue to cache

    return Response({
      "id": "of.pk"
    }, status=status.HTTP_201_CREATED)
