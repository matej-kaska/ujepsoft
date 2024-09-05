from datetime import timedelta
import os
import random
import re
import string
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.authtoken.views import ObtainAuthToken as DefaultObtainAuthToken
from rest_framework.authtoken.models import Token
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from rest_framework import permissions, generics
from users.serializers.serializers import UserPublicSerializer, UserSerializer

from users.models import PasswordResetCode, RegistrationCode, User

class ObtainAuthToken(DefaultObtainAuthToken):

  def post(self, request, *args, **kwargs):
    email = request.data['email'].lower()
    password = request.data['password']

    try:
      user = User.objects.get(email=email)
    except User.DoesNotExist:
      return Response({
        "en": "Invalid credentials",
        "cz": "Neplatné přihlašovací údaje"
      }, status=400)

    if not user.check_password(password):
      return Response({
        "en": "Invalid credentials",
        "cz": "Neplatné přihlašovací údaje"
      }, status=400)

    token, created = Token.objects.get_or_create(user=user)
    return Response({
      'token': token.key,
    })
    
class UserViewSet(APIView):
  permission_classes = (permissions.IsAuthenticated,)
  serializer_class = UserSerializer

  def get(self, request):
    user = request.user
    serializer = self.serializer_class(user)
    return Response(serializer.data)
    
class UserPublicRetrieveView(generics.RetrieveAPIView):
  serializer_class = UserPublicSerializer
  queryset = UserSerializer.Meta.model.objects.all()

class RegisterView(APIView):
  def post(self, request):
    password = request.data.get('password')
    password_again = request.data.get('password_again')
    email = request.data.get('email').lower()

    # Check requried fields
    if not password or not password_again or not email:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    # Check passwords
    if password != password_again:
      return Response({
        "en": "Passwords don't match",
        "cz": "Hesla se neshodují"
      }, status=400)

    # Check password length
    if len(password) < 8:
      return Response({
        "en": "Password too short",
        "cz": "Heslo je příliš krátké"
      }, status=400)
    
    if len(password) > 100:
      return Response({
        "en": "Password too long",
        "cz": "Heslo je příliš dlouhé"
      }, status=400)

    # Validate email
    try:
      validate_email(email)
    except ValidationError:
      return Response({
        "en": "Invalid e-mail",
        "cz": "Neplatný e-mail"
      }, status=400)
    
    if re.match('^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(?!students\.)(([^@.]+\.)*ujep\.cz)$'):
      return Response({
        "en": "This e-mail doesn't have @ujep.cz domain (except students)",
        "cz": "Tento e-mail nemá doménu @ujep.cz (mimo students)"
      }, status=400)

    # Check if email is taken
    if User.objects.filter(email=email).exists():
      return Response({
        "en": "Email already taken",
        "cz": "Email je již zabraný"
      }, status=400)

    # Send e-mail with validation link
    code = "".join([random.choice(string.ascii_letters + string.digits) for _ in range(64)])
    registration_code = RegistrationCode.objects.create(
      email=email,
      code=code,
      password=make_password(password),
    )

    url_base = os.environ.get("DJANGO_URL_BASE", "http://localhost:8080/")
    registration_link = f"{url_base}?registration={registration_code.code}"

    template_args = {
      "email": email,
      "link": registration_link,
    }
    html_message = render_to_string("users/registration_link_email.html", template_args)
    txt_message = render_to_string("users/registration_link_email.txt", template_args)

    send_mail(
      subject="UJEP Soft - Aktivační odkaz",
      message=txt_message,
      html_message=html_message,
      from_email=os.environ.get("DJANGO_EMAIL_FROM", "ujepsoft@hotmail.com"),
      recipient_list=[email],
    )

    return Response(status=200)

class RegisterValidatedView(APIView):

  def post(self, request):
    code = request.data.get('token')

    if not code:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    token = RegistrationCode.objects.get(code=code)

    if not token:
      return Response({
        "en": "Token doesn't exist",
        "cz": "Tento odkaz neexistuje"
        }, status=400)
    
    if token.used:
        return Response({
          "en": "Token already used",
          "cz": "Tento odkaz byl již použit"
        }, status=400)
    
    if token.created_at < timezone.now() - timedelta(hours=1):
      return Response({
        "en": "Token expired",
        "cz": "Tento odkaz již vypršel"
      }, status=400)
    
    if User.objects.filter(email=token.email).exists():
      return Response({
        "en": "E-mail already taken",
        "cz": "Tento e-mail je již zabraný"
      }, status=400)

    # Create user
    user = User(
      email=token.email,
      password=token.password,
    )

    user.save()

    token.used = True
    token.save()

    return Response(status=201)

class RequestPasswordResetView(APIView):

  def post(self, request):
    email = request.data.get('email').lower()

    if not email:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    try:
        validate_email(email)
    except ValidationError:
      return Response({
        "en": "Invalid email",
        "cz": "Neplatný email"
      }, status=400)
    
    if re.match('^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(?!students\.)(([^@.]+\.)*ujep\.cz)$'):
      return Response({
        "en": "This e-mail doesn't have @ujep.cz domain (except students)",
        "cz": "Tento e-mail nemá doménu @ujep.cz (mimo students)"
      }, status=400)

    user = get_object_or_404(User, email=email)
    code = "".join([random.choice(string.ascii_letters + string.digits) for _ in range(64)])
    reset_code = PasswordResetCode.objects.create(
      user=user,
      code=code,
    )

    url_base = os.environ.get("DJANGO_URL_BASE", "http://localhost:8080/")
    reset_link = f"{url_base}?token={reset_code.code}"

    template_args = {
      "user": user,
      "link": reset_link,
    }
    html_message = render_to_string("users/password_reset_email.html", template_args)
    txt_message = render_to_string("users/password_reset_email.txt", template_args)

    send_mail(
      subject="UJEP Soft - změna hesla",
      message=txt_message,
      html_message=html_message,
      from_email=os.environ.get("DJANGO_EMAIL_FROM", "ujepsoft@hotmail.com"),
      recipient_list=[email],
    )

    return Response(status=200)

class PasswordResetView(APIView):

  def post(self, request):
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    new_password_again = request.data.get('new_password_again')

    if not code:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)

    if not new_password or not new_password_again:
      return Response({
        "en": "Please fill all required fields",
        "cz": "Vyplňte prosím všechna povinná pole"
      }, status=400)
    
    if new_password != new_password_again:
      return Response({
        "en": "New passwords don't match",
        "cz": "Nová hesla se neshodují"
        }, status=400)

    if len(new_password) < 8:
      return Response({
        "en": "New pasword length must be at least 8 characters",
        "cz": "Nové heslo musí mít alespoň 8 znaků"
      }, status=400)
    
    reset_code = get_object_or_404(
      PasswordResetCode, code=code, used=False,
      created_at__gte=timezone.now() - timedelta(hours=1)
    )

    user = reset_code.user

    user.set_password(new_password)
    user.save()

    reset_code.used = True
    reset_code.save()

    return Response(status=200)