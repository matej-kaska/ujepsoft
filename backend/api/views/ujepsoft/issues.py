import json
import os
from datetime import datetime, timezone

from api.models import Comment, Issue, Label, ReactionsComment, ReactionsIssue, Repo
from api.serializers.serializers import IssueCacheSerializer, IssueSerializer
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache

from api.services import GitHubAPIService
from api.permissions import IsStaffUser
from api.pagination import IssuePagination
from utils.issues.new_obj import create_issue, update_issue
from utils.issues.utils import find_obj_by_id

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
      page = self.paginate_queryset(response)
      if page is not None:
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
      
      serializer = self.get_serializer(response, many=True)
      return Response(serializer.data,status=status.HTTP_200_OK)

    fetched_issues = GitHubAPIService.get_all_issues()

    for issue in issues:

      fetched_issue = find_obj_by_id(fetched_issues, issue.gh_id)
      
      # Getting new issue
      if fetched_issue is None:
        fetched_issue = GitHubAPIService.get_issue(issue.repo.author, issue.repo.name, issue.number)
        if fetched_issue is None:
          issue.delete()
          print(f"deleting issue {issue.number}")
          continue
        create_issue(fetched_issue, issue.repo, issue.repo.author, issue.repo.name)
        print(f"creating new issue {issue.number}")

      # Getting updated issue
      if datetime.strptime(fetched_issue["updated_at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc) != issue.updated_at:
        response.append(update_issue(issue.pk, fetched_issue, issue.repo.author, issue.repo.name))
        print(f"updating issue {issue.number}")
        continue

      # Getting issue from database
      issueSerializer = IssueCacheSerializer(issue)
      cache.set("issue-" + str(issue.pk), json.dumps(issueSerializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))
      # TODO: full serializer
      response.append(issue)
      print(f"getting issue {issue.number} from db")

    page = self.paginate_queryset(response)
    if page is not None:
      serializer = self.get_serializer(page, many=True)
      return self.get_paginated_response(serializer.data)
    
    serializer = self.get_serializer(response, many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)