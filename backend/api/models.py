from django.db import models
from django.core.validators import URLValidator

from users.models import User

class Keyword(models.Model):
  name = models.CharField(max_length=63)

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"

class Offer(models.Model):
  name = models.CharField(max_length=100)
  description = models.CharField(max_length=8191)
  keywords = models.ManyToManyField(Keyword, related_name='offers', blank=True)
  author = models.ForeignKey(User, on_delete=models.PROTECT, null=True)

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"

class OfferFile(models.Model):
  name = models.CharField(max_length=255)
  file = models.FileField(upload_to='offer_files')
  offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='files')
  file_type = models.CharField(max_length=5, choices=[('file', 'file'), ('image', 'image')])

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] ({self.type}) {self.name}"
  
class Repo(models.Model):
  name = models.CharField(max_length=255)
  description = models.CharField(max_length=8191, blank=True)
  url = models.CharField(max_length=255)
  author = models.CharField(max_length=255)
  author_profile_pic = models.CharField(max_length=1023)
  private = models.BooleanField(default=False)
  collaborant = models.BooleanField(default=True)

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"

class Label(models.Model):
  name = models.CharField(max_length=63)
  description = models.CharField(max_length=255)
  color = models.CharField(max_length=7)

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"

class Issue(models.Model):
  number = models.CharField()
  gh_id = models.CharField()
  title = models.CharField(max_length=255)
  body = models.CharField(max_length=8191, blank=True)
  state = models.CharField(max_length=15)
  labels = models.ManyToManyField(Label, related_name='issues')
  repo = models.ForeignKey(Repo, on_delete=models.CASCADE, related_name='issues')
  author = models.CharField(max_length=255)
  author_profile_pic = models.CharField(max_length=1023)
  author_ujepsoft = models.CharField(max_length=320, blank=True)
  created_at = models.DateTimeField()
  updated_at = models.DateTimeField()

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.title}"

class Comment(models.Model):
  number = models.CharField()
  body = models.CharField(max_length=8191)
  issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
  author = models.CharField(max_length=255)
  author_profile_pic = models.CharField(max_length=1023)
  author_ujepsoft = models.CharField(max_length=320, blank=True)
  created_at = models.DateTimeField()
  updated_at = models.DateTimeField()

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.number}"

class ReactionsIssue(models.Model):
  name = models.CharField(max_length=63)
  count = models.IntegerField()
  issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='reactions_issue')

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"

class ReactionsComment(models.Model):
  name = models.CharField(max_length=63)
  count = models.IntegerField()
  comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reactions_comment')

  def __str__(self):
    return repr(self)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
class IssueFile(models.Model):
  name = models.CharField(max_length=255)
  file = models.FileField(upload_to='issue_files')
  issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='files')
  file_type = models.CharField(max_length=5, choices=[('file', 'file'), ('image', 'image')])
  remote_url = models.CharField(max_length=1024, blank=True, validators=[URLValidator()])

  def __str__(self):
    return repr(self)
  
  def save(self, *args, **kwargs):
    if self.remote_url:
      self.file = None
    else:
      self.remote_url = ""
    super(IssueFile, self).save(*args, **kwargs)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"
  
class CommentFile(models.Model):
  name = models.CharField(max_length=255)
  file = models.FileField(upload_to='comment_files', blank=True, null=True)
  comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='files')
  file_type = models.CharField(max_length=5, choices=[('file', 'file'), ('image', 'image')])
  remote_url = models.CharField(max_length=1024, blank=True, validators=[URLValidator()])

  def __str__(self):
    return repr(self)
  
  def save(self, *args, **kwargs):
    if self.remote_url:
      self.file = None
    else:
      self.remote_url = ""
    super(CommentFile, self).save(*args, **kwargs)
  
  def __repr__(self):
    return f"[{self.pk}] {self.name}"