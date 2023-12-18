from django.db import models

from users.models import User

class Keyword(models.Model):
  name = models.CharField(max_length=63)

  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
  def __str__(self):
    return repr(self)

class Offer(models.Model):
  name = models.CharField(max_length=100)
  description = models.CharField(max_length=8192)
  keywords = models.ManyToManyField(Keyword, related_name='offers', blank=True)
  author = models.ForeignKey(User, on_delete=models.PROTECT, null=True)

  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
  def __str__(self):
    return repr(self)

class File(models.Model):
  name = models.CharField(max_length=255)
  file = models.FileField(upload_to='files')
  offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='files')

  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
  def __str__(self):
    return repr(self)
  
class Repo(models.Model):
  name = models.CharField(max_length=255)
  description = models.CharField(max_length=8192, null=True, blank=True)
  url = models.CharField(max_length=255)
  author = models.CharField(max_length=255)
  author_profile_pic = models.CharField(max_length=1023)
  private = models.BooleanField(default=False)
  collaborant = models.BooleanField(default=True)

  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
  def __str__(self):
    return repr(self)

class Label(models.Model):
  name = models.CharField(max_length=63)
  description = models.CharField(max_length=255)
  color = models.CharField(max_length=7)

  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
  def __str__(self):
    return repr(self)

class Issue(models.Model):
  number = models.CharField()
  gh_id = models.CharField()
  title = models.CharField(max_length=255)
  body = models.CharField(max_length=8192, blank=True, null=True)
  state = models.CharField(max_length=15)
  labels = models.ManyToManyField(Label, related_name='issues')
  repo = models.ForeignKey(Repo, on_delete=models.CASCADE, related_name='issues')
  author = models.CharField(max_length=255)
  author_profile_pic = models.CharField(max_length=1023)
  created_at = models.DateTimeField()
  updated_at = models.DateTimeField()

  def __repr__(self):
    return f"[{self.pk}] {self.title}"
  
  def __str__(self):
    return repr(self)

class Comment(models.Model):
  number = models.CharField()
  body = models.CharField(max_length=8192)
  issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
  author = models.CharField(max_length=255)
  author_profile_pic = models.CharField(max_length=1023)
  created_at = models.DateTimeField()
  updated_at = models.DateTimeField()

  def __repr__(self):
    return f"[{self.pk}] {self.number}"
  
  def __str__(self):
    return repr(self)

class ReactionsIssue(models.Model):
  name = models.CharField(max_length=63)
  count = models.IntegerField()
  issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='reactions_issue')

  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
  def __str__(self):
    return repr(self)

class ReactionsComment(models.Model):
  name = models.CharField(max_length=63)
  count = models.IntegerField()
  comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reactions_comment')

  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
  def __str__(self):
    return repr(self)