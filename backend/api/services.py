import os
import requests

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
