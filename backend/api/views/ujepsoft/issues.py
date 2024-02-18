import json
import os
from datetime import datetime, timezone

from api.models import Issue, Repo
from api.serializers.serializers import IssueCacheSerializer, IssueSerializer
from rest_framework import status, permissions, generics
from rest_framework.response import Response
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