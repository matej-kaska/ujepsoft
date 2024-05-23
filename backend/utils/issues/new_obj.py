import datetime
from api.models import Comment, CommentFile, Issue, IssueFile, Label
from api.serializers.serializers import IssueFullSerializer, IssueSerializer
from api.services import GitHubAPIService
import json
import os
from django.core.cache import cache

from utils import REDIS_TIMEOUT
from utils.issues.utils import extract_files_from_github, find_comment_by_id, get_ujepsoft_author, markdown_to_html, remove_file_extenstion_from_name, remove_files_from_description

def create_issue(issue, associated_repo, user, repo):
  """
  Create issue object with all related objects
  """
  if issue is None:
    return None

  try:
    new_issue = Issue.objects.get(number=issue['number'], repo=associated_repo)
  except Issue.DoesNotExist:
    
    if issue.get('pull_request', None) is not None:
      return None
    
    if issue['user']['login'] == os.getenv('GITHUB_USERNAME'):
      author_ujepsoft = get_ujepsoft_author(issue['body'])
    else:
      author_ujepsoft = ""

    if not author_ujepsoft and issue.get('body', ''):
      issue['body'] = markdown_to_html(issue['body'])

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

  images, files = extract_files_from_github(issue.get('body', ''))

  new_body = issue.get('body', '') or ''

  if new_body != "":
    cleaned_body = remove_files_from_description(new_body, images, files)

    if cleaned_body != new_body:
      new_issue.body = cleaned_body
      new_issue.save()

  for file in files:
    IssueFile.objects.create(
      name=remove_file_extenstion_from_name(file[0]),
      file_type='file',
      remote_url=file[1],
      issue=new_issue
    )

  for image in images:
    IssueFile.objects.create(
      name=remove_file_extenstion_from_name(image[0]),
      file_type='image',
      remote_url=image[1],
      issue=new_issue
    )

  if issue['comments'] > 0:
    issue_comments = GitHubAPIService.get_issue_comments(user, repo, issue['number'])
    if issue_comments is not None:
      for comment in issue_comments:
        try:
          new_comment = Comment.objects.get(number=comment['id'], issue=new_issue)
        except Comment.DoesNotExist:
          
          if comment['user']['login'] == os.getenv('GITHUB_USERNAME'):
            author_ujepsoft = get_ujepsoft_author(comment['body'])
          else:
            author_ujepsoft = ""

          if not author_ujepsoft and comment.get('body', ''):
            comment['body'] = markdown_to_html(comment['body'])

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

          images, files = extract_files_from_github(new_comment.body)

          if new_comment.body != "":
            cleaned_body = remove_files_from_description(new_comment.body, images, files)

            if cleaned_body != new_comment.body:
              new_comment.body = cleaned_body
              new_comment.save()
          
          for file in files:
            CommentFile.objects.create(
              name=remove_file_extenstion_from_name(file[0]),
              file_type='file',
              remote_url=file[1],
              comment=new_comment
            )

          for image in images:
            CommentFile.objects.create(
              name=remove_file_extenstion_from_name(image[0]),
              file_type='image',
              remote_url=image[1],
              comment=new_comment
            )

  issue_serializer = IssueSerializer(new_issue)
  cache.set("issue-" + str(new_issue.pk), json.dumps(issue_serializer.data), timeout=REDIS_TIMEOUT)

  issue_full_serializer = IssueFullSerializer(new_issue)
  cache.set("issue-full-" + str(new_issue.pk), json.dumps(issue_full_serializer.data), timeout=REDIS_TIMEOUT)

def update_issue(issue_pk, new_issue, user, repo):
  """
  Update issue object with all related objects
  """
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
  
  if not get_ujepsoft_author(new_issue['body']) and new_issue.get('body', ''):
    updating_issue.body = markdown_to_html(new_issue['body'])
  else:
    updating_issue.body = new_issue['body']

  if updating_issue.body is None:
    updating_issue.body = ""

  for label in new_issue['labels']:
    label_name = label['name']
    try:
      label_obj = Label.objects.get(name=label_name)
      if label_obj not in updating_issue.labels.all():
        updating_issue.labels.add(label_obj)
    except Label.DoesNotExist:
      print(f"Label {label_name} does not exist! Not Creating it!")

  images, files = extract_files_from_github(new_issue.get('body', '') or '')

  if updating_issue.body != "":
    cleaned_body = remove_files_from_description(updating_issue.body, images, files)

    if cleaned_body != updating_issue.body:
      updating_issue.body = cleaned_body
      updating_issue.save()

  # Delete old files
  old_files = IssueFile.objects.filter(issue=updating_issue)
  for old_file in old_files:
    if old_file.name not in [file[0] for file in files]:
      old_file.delete()

  for file in files:
    try:
      IssueFile.objects.get(name=file[0], issue=updating_issue)
    except IssueFile.DoesNotExist:
      IssueFile.objects.create(
        name=remove_file_extenstion_from_name(file[0]),
        file_type='file',
        remote_url=file[1],
        issue=updating_issue
      )

  for image in images:
    try:
      IssueFile.objects.get(name=image[0], issue=updating_issue)
    except IssueFile.DoesNotExist:
      IssueFile.objects.create(
        name=remove_file_extenstion_from_name(image[0]),
        file_type='image',
        remote_url=image[1],
        issue=updating_issue
      )

  fetched_comments = GitHubAPIService.get_issue_comments(user, repo, new_issue['number'])

  comments = Comment.objects.filter(issue=updating_issue)
  comments_ids = [comment.number for comment in comments]

  for fetched_comment in fetched_comments:
    comment = find_comment_by_id(comments, fetched_comment["id"])

    # Creating new comment
    if comment is None:
      create_comment(fetched_comment, updating_issue)
      continue

    comments_ids.remove(str(comment.number))

    # Updating comment
    if datetime.datetime.strptime(fetched_comment["updated_at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc) != comment.updated_at:
      update_comment(fetched_comment, updating_issue)
      continue
  
  if len(comments_ids) > 0:
    Comment.objects.filter(number__in=comments_ids).delete()

  updating_issue.save()

  issue_serializer = IssueSerializer(updating_issue)
  cache.set("issue-" + str(updating_issue.pk), json.dumps(issue_serializer.data), timeout=REDIS_TIMEOUT)

  issue_full_serializer = IssueFullSerializer(updating_issue)
  cache.set("issue-full-" + str(updating_issue.pk), json.dumps(issue_full_serializer.data), timeout=REDIS_TIMEOUT)

  return updating_issue

def update_comment(comment, associated_issue):
  """
  Update comment object
  """
  new_comment = Comment.objects.get(number=comment['id'], issue=associated_issue)
  new_comment.updated_at = comment['updated_at']
  new_comment.author_profile_pic=comment['user']['avatar_url']
  
  if not get_ujepsoft_author(comment['body']) and comment.get('body', ''):
    new_comment.body = markdown_to_html(comment['body'])
  else:
    new_comment.body = comment['body']

  images, files = extract_files_from_github(new_comment.body or '')

  if new_comment.body != "":
    cleaned_body = remove_files_from_description(new_comment.body, images, files)

    if cleaned_body != new_comment.body:
      new_comment.body = cleaned_body
      new_comment.save()

  new_comment.save()

  # Delete old files
  old_files = CommentFile.objects.filter(comment=new_comment)
  for old_file in old_files:
    if old_file.name not in [file[0] for file in files]:
      old_file.delete()

  for file in files:
    try:
      CommentFile.objects.get(name=file[0], comment=new_comment)
    except CommentFile.DoesNotExist:
      CommentFile.objects.create(
        name=remove_file_extenstion_from_name(file[0]),
        file_type='file',
        remote_url=file[1],
        comment=new_comment
      )

  for image in images:
    try:
      CommentFile.objects.get(name=image[0], comment=new_comment)
    except CommentFile.DoesNotExist:
      CommentFile.objects.create(
        name=remove_file_extenstion_from_name(image[0]),
        file_type='image',
        remote_url=image[1],
        comment=new_comment
      )

def create_comment(comment, associated_issue):
  """
  Create comment object
  """
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

  images, files = extract_files_from_github(new_comment.body or '')

  if new_comment.body != "":
    cleaned_body = remove_files_from_description(new_comment.body, images, files)

    if cleaned_body != new_comment.body:
      new_comment.body = cleaned_body
      new_comment.save()

  for file in files:
    CommentFile.objects.create(
      name=remove_file_extenstion_from_name(file[0]),
      file_type='file',
      remote_url=file[1],
      comment=new_comment
    )

  for image in images:
    CommentFile.objects.create(
      name=remove_file_extenstion_from_name(image[0]),
      file_type='image',
      remote_url=image[1],
      comment=new_comment
    )