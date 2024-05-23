from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import requests

from api.models import Repo

class GitHubAPIService:
  """
  Service class for GitHub API calls
  """
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
  def update_profile_picture(cls, user, repo_name, repo):
    url = f"https://api.github.com/repos/{user}/{repo_name}"
    response = cls.session.get(url)
    if response.status_code == 200:
      parsed_response = response.json()
      if repo.author_profile_pic != parsed_response.get("owner").get("avatar_url"):
        repo.author_profile_pic = parsed_response.get("owner").get("avatar_url")
        repo.save()
  
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

    def fetch_and_process(repo):
      issues = cls.get_repo_issues(repo.author, repo.name)
      if issues is None:
        Repo.objects.filter(pk=repo.pk).delete()
        return []
      cls.update_profile_picture(repo.author, repo.name, repo)
      if not issues:
        return []
      processed_issues = []
      for issue in issues:
        if 'pull_request' not in issue:
          issue['repo'] = repo.name
          issue['author'] = repo.author
          processed_issues.append(issue)
      return processed_issues

    with ThreadPoolExecutor(max_workers=10) as executor:
      future_to_repo = {executor.submit(fetch_and_process, repo): repo for repo in repos}
      for future in as_completed(future_to_repo):
        repo = future_to_repo[future]
        try:
          response.extend(future.result())
        except Exception as exc:
          print(f'{repo.name} generated an exception: {exc}')
    
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
  
  @classmethod
  def post_comment(cls, user, repo_name, issue_number, body):
    data = {
      "body": body
    }
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues/{issue_number}/comments"
    response = cls.session.post(url, json=data)
    return response.json() if response.status_code == 201 else None

  @classmethod
  def update_comment(cls, user, repo_name, comment_id, body):
    data = {
      "body": body
    }
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues/comments/{comment_id}"
    response = cls.session.patch(url, json=data)
    return response.json() if response.status_code == 200 else None
  
  @classmethod
  def delete_comment(cls, user, repo_name, comment_id):
    url = f"https://api.github.com/repos/{user}/{repo_name}/issues/comments/{comment_id}"
    response = cls.session.delete(url)
    return True if response.status_code == 204 else None