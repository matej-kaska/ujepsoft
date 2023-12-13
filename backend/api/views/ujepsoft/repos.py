import json
import os

from api.models import Comment, Issue, Label, ReactionsComment, ReactionsIssue, Repo
from api.serializers.serializers import RepoSerializer, RepoFullSerializer
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.cache import cache

from api.services import GitHubAPIService
from utils.repos.utils import checkCollaborant, checkLabels

class ReposList(generics.ListAPIView):
  permission_classes = (permissions.IsAuthenticated,)
  serializer_class = RepoSerializer

  def get_queryset(self):
    return Repo.objects.all()
  
class RepoAdd(APIView):
  permission_classes = (permissions.IsAuthenticated,)

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
    
    if not self.request.user.is_staff:
      return Response({
        "en": "You are not authorized to add a repository",
        "cz": "Nemáte oprávnění přidat repozitář"
      }, status=status.HTTP_403_FORBIDDEN)
    
    user, repo = url.split('/')[-2:]

    isCollaborant = checkCollaborant(user, repo)

    if not isCollaborant:
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
    
    areLabelsSet = checkLabels(user, repo)

    if not areLabelsSet:
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
      try:
        new_issue = Issue.objects.get(number=issue['number'], repo=new_repo)
      except Issue.DoesNotExist:
        
        new_issue = Issue.objects.create(
          number=issue['number'],
          title=issue['title'],
          body=issue['body'],
          state=issue['state'],
          repo=new_repo,
          author=issue['user']['login'],
          author_profile_pic=issue['user']['avatar_url'],
          created_at=issue['created_at'],
          updated_at=issue['updated_at'],
        )
        
      for label in issue['labels']:
        label_name = label['name']
        try:
          label_obj = Label.objects.get(name=label_name)
          new_issue.labels.add(label_obj)
        except:
          print(f"Label {label_name} does not exist! Not Creating it!")

      for reaction_type, count in issue['reactions'].items():
          if reaction_type in ['url', 'total_count'] or count == 0:
              continue

          reaction_obj, created = ReactionsIssue.objects.get_or_create(
              name=reaction_type, 
              issue=new_issue,
              defaults={'count': count}
          )

          if not created:
              reaction_obj.count = count
              reaction_obj.save()

      if issue['comments'] > 0:
        issue_comments = GitHubAPIService.get_issue_comments(user, repo, issue['number'])
        for comment in issue_comments:
          try:
            new_comment = Comment.objects.get(number=comment['id'], issue=new_issue)
          except Comment.DoesNotExist:
            new_comment = Comment.objects.create(
              number=comment['id'],
              body=comment['body'],
              issue=new_issue,
              author=comment['user']['login'],
              author_profile_pic=comment['user']['avatar_url'],
              created_at=comment['created_at'],
              updated_at=comment['updated_at'],
            )
          
          for reaction_type, count in comment['reactions'].items():
            if reaction_type in ['url', 'total_count'] or count == 0:
                continue

            reaction_obj, created = ReactionsComment.objects.get_or_create(
                name=reaction_type, 
                comment=new_comment,
                defaults={'count': count}
            )

            if not created:
                reaction_obj.count = count
                reaction_obj.save()

    serializer = RepoFullSerializer(new_repo)

    cache.set("repo" + str(new_repo.pk), json.dumps(serializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))
    
    return Response(status=status.HTTP_201_CREATED)
  
class RepoDelete(APIView):
  permission_classes = (permissions.IsAuthenticated,)

  def delete(self, request, pk):
    if not self.request.user.is_staff:
      return Response({
        "en": "You are not authorized to delete a repository",
        "cz": "Nemáte oprávnění smazat repozitář"
      }, status=status.HTTP_403_FORBIDDEN)
    
    try:
      repo = Repo.objects.get(pk=pk)
    except Repo.DoesNotExist:
      return Response({
        "en": "Repository not found",
        "cz": "Repozitář nebyl nalezen"
      }, status=status.HTTP_400_BAD_REQUEST)
    
    isCollaborant = checkCollaborant(repo.author, repo.name)

    if not isCollaborant:
      return Response({
        "en": "You are not a collaborant of this repository",
        "cz": "Nejste collaborantem tohoto repozitáře"
      }, status=status.HTTP_403_FORBIDDEN)
    
    repo.delete()

    cache.delete("repo" + str(pk))

    return Response(status=status.HTTP_204_NO_CONTENT)