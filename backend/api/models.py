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