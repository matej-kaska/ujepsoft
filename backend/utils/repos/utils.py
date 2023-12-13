from api.services import GitHubAPIService
import os

from api.models import Label

def checkCollaborant(user, repo):
  response = GitHubAPIService.get_repo_collaborators(user, repo)

  if response is None:
    return False
  for collaborant in response:
    if collaborant['login'] == os.environ['GITHUB_USERNAME']:
      return True
  return False

def checkLabels(user, repo):
  response = GitHubAPIService.get_repo_labels(user, repo)

  if response is None:
    return False
  
  existing_labels = []
  disered_labels = Label.objects.all()

  for label in response:
    existing_labels.append(label['name'])

  for label in disered_labels:
    if label.name not in existing_labels:
      data={
        "name": label.name,
        "description": label.description,
        "color": label.color
      }
      GitHubAPIService.post_repo_labels(user, repo, data)

  return True