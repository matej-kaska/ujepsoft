import datetime
from api.models import Comment, Issue, Label, ReactionsComment, ReactionsIssue
from api.serializers.serializers import IssueCacheSerializer, IssueFullSerializer
from api.services import GitHubAPIService
import json
import os
from django.core.cache import cache

from utils.issues.utils import find_comment_by_id, get_ujepsoft_author

def create_issue(issue, associated_repo, user, repo):
  try:
    new_issue = Issue.objects.get(number=issue['number'], repo=associated_repo)
  except Issue.DoesNotExist:
    
    if issue.get('pull_request', None) is not None:
      return None
    
    if issue['user']['login'] == os.getenv('GITHUB_USERNAME'):
      author_ujepsoft = get_ujepsoft_author(issue['body'])
    else:
      author_ujepsoft = ""

    new_issue = Issue.objects.create(
      number=issue['number'],
      gh_id=issue['id'],
      title=issue['title'],
      body=issue.get('body', '') or '',
      state=issue['state'],
      repo=associated_repo,
      author=issue['user']['login'],
      author_profile_pic=issue['user']['avatar_url'],
      created_at=issue['created_at'],
      updated_at=issue['updated_at'],
      author_ujepsoft=author_ujepsoft
    )
    
  for label in issue['labels']:
    label_name = label['name']
    try:
      label_obj = Label.objects.get(name=label_name)
      new_issue.labels.add(label_obj)
    except Label.DoesNotExist:
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
        
        if comment['user']['login'] == os.getenv('GITHUB_USERNAME'):
          author_ujepsoft = get_ujepsoft_author(comment['body'])
        else:
          author_ujepsoft = ""

        new_comment = Comment.objects.create(
          number=comment['id'],
          body=comment['body'],
          issue=new_issue,
          author=comment['user']['login'],
          author_profile_pic=comment['user']['avatar_url'],
          created_at=comment['created_at'],
          updated_at=comment['updated_at'],
          author_ujepsoft=author_ujepsoft
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

  issue_serializer = IssueCacheSerializer(new_issue)
  cache.set("issue-" + str(new_issue.pk), json.dumps(issue_serializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))

  issue_full_serializer = IssueFullSerializer(new_issue)
  cache.set("issue-full-" + str(new_issue.pk), json.dumps(issue_full_serializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))

def update_issue(issue_pk, new_issue, user, repo):
  try:
    updating_issue = Issue.objects.get(pk=issue_pk)
  except Issue.DoesNotExist:
    return None
  
  updating_issue.title = new_issue["title"]
  updating_issue.body = new_issue["body"]
  updating_issue.state = new_issue["state"]
  updating_issue.updated_at = new_issue["updated_at"]
  updating_issue.author_profile_pic = new_issue["user"]["avatar_url"]
  updating_issue.labels.clear()

  for label in new_issue['labels']:
    label_name = label['name']
    try:
      label_obj = Label.objects.get(name=label_name)
      if label_obj not in updating_issue.labels.all():
        updating_issue.labels.add(label_obj)
    except Label.DoesNotExist:
      print(f"Label {label_name} does not exist! Not Creating it!")


  for reaction_type, count in new_issue['reactions'].items():
    if reaction_type in ['url', 'total_count'] or count == 0:
      continue

    reaction_obj, created = ReactionsIssue.objects.get_or_create(
      name=reaction_type, 
      issue=updating_issue,
      defaults={'count': count}
    )

    if not created:
      reaction_obj.count = count
      reaction_obj.save()


  fetched_comments = GitHubAPIService.get_issue_comments(user, repo, new_issue['number'])

  comments = Comment.objects.filter(issue=updating_issue)
  comments_ids = [comment.number for comment in comments]

  for fetched_comment in fetched_comments:
    comment = find_comment_by_id(comments, fetched_comment["id"])

    # Creating new comment
    if comment is None:
      create_comment(fetched_comment, updating_issue)
      print(f"creating new comment {fetched_comment['id']}")
      continue

    comments_ids.remove(str(comment.number))

    # Updating comment
    if datetime.datetime.strptime(fetched_comment["updated_at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc) != comment.updated_at:
      update_comment(fetched_comment, updating_issue)
      print(f"updating comment {fetched_comment['id']}")
      continue
  
  if len(comments_ids) > 0:
    Comment.objects.filter(number__in=comments_ids).delete()
    print(f"removing comments {comments_ids}")

  updating_issue.save()

  issue_serializer = IssueCacheSerializer(updating_issue)
  cache.set("issue-" + str(updating_issue.pk), json.dumps(issue_serializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))

  issue_full_serializer = IssueFullSerializer(updating_issue)
  cache.set("issue-full-" + str(updating_issue.pk), json.dumps(issue_full_serializer.data), timeout=int(os.getenv('REDIS-TIMEOUT')))

  return updating_issue

def update_comment(comment, associated_issue):
  new_comment = Comment.objects.get(number=comment['id'], issue=associated_issue)
  new_comment.body = comment['body']
  new_comment.updated_at = comment['updated_at']
  new_comment.author_profile_pic=comment['user']['avatar_url'],
  new_comment.save()
  
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

def create_comment(comment, associated_issue):

  if comment['user']['login'] == os.getenv('GITHUB_USERNAME'):
    author_ujepsoft = get_ujepsoft_author(comment['body'])
  else:
    author_ujepsoft = ""

  new_comment = Comment.objects.create(
    number=comment['id'],
    body=comment['body'],
    issue=associated_issue,
    author=comment['user']['login'],
    author_profile_pic=comment['user']['avatar_url'],
    created_at=comment['created_at'],
    updated_at=comment['updated_at'],
    author_ujepsoft=author_ujepsoft
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