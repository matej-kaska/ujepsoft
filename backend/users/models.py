from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager

class User(AbstractUser):
  profile_image = models.ImageField(upload_to='profile_images', blank=True)

  username = None
  email = models.EmailField(unique=True)

  USERNAME_FIELD = "email"
  REQUIRED_FIELDS = []

  objects = CustomUserManager()

  def __str__(self):
    return self.email

class RegistrationCode(models.Model):
  email = models.CharField(max_length=320)
  code = models.CharField(max_length=64)
  used = models.BooleanField(default=False)
  password = models.CharField(max_length=100)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return str(self.pk)

class PasswordResetCode(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  code = models.CharField(max_length=64)
  used = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return str(self.pk)