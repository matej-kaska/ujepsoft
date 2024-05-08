import os
import requests

from api.models import Repo

class GitHubAPIService:
  session = requests.Session()
  token = os.getenv('GITHUB_TOKEN')
  session.headers.update({'Authorization': f'Bearer {token}'})

  @classmethod
  def get_repo_data(cls, user, repo_name):
    url = f"https://api.github.com/repos/{user}/{repo_name}"
    response = cls.session.get(url)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def get_repo_issues(cls, user, repo_name):
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues?state=all"
    response = cls.session.get(url)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def get_issue_comments(cls, user, repo_name, issue_number):
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues/{issue_number}/comments"
    response = cls.session.get(url)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def get_repo_collaborators(cls, user, repo_name):
    url = f"https://api.github.com/repos/{user}/{repo_name}/collaborators"
    response = cls.session.get(url)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def get_repo_labels(cls, user, repo_name):
    url = f"https://api.github.com/repos/{user}/{repo_name}/labels"
    response = cls.session.get(url)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def post_repo_labels(cls, user, repo_name, data):
    url = f"https://api.github.com/repos/{user}/{repo_name}/labels"
    response = cls.session.post(url, data=data)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def get_issue(cls, user, repo_name, issue_number):
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues/{issue_number}"
    response = cls.session.get(url)
    return response.json() if response.status_code == 200 else None

  @classmethod
  def get_all_issues(cls):
    repos = Repo.objects.all()
    response = []

    for repo in repos:
      issues = cls.get_repo_issues(repo.author, repo.name)
      if issues is None:
        Repo.objects.filter(pk=repo.pk).delete()
        continue
      if len(issues) == 0:
        continue
      for issue in issues:
        if 'pull_request' not in issue:
          issue['repo'] = repo.name
          response.append(issue)
    
    return response
  
  @classmethod
  def post_issue(cls, user, repo_name, title, body, labels):
    data = {
      "title": title,
      "body": body,
      "assignees": [user],
      "labels": labels
    }
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues"
    response = cls.session.post(url, json=data)
    return response.json() if response.status_code == 201 else None
  
  @classmethod
  def update_issue(cls, user, repo_name, issue_number, title, body, labels):
    data = {
      "title": title,
      "body": body,
      "labels": labels
    }
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues/{issue_number}"
    response = cls.session.patch(url, json=data)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def delete_issue(cls, user, repo_name, issue_number):
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues/{issue_number}"
    data = {'state': 'closed'}
    response = cls.session.patch(url, json=data)
    return response.json() if response.status_code == 200 else None