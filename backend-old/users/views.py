from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.authtoken.views import ObtainAuthToken as DefaultObtainAuthToken
from rest_framework.authtoken.models import Token

from users.models import User
from eduklub.models import FavoriteList

class ObtainAuthToken(DefaultObtainAuthToken):

    def post(self, request, *args, **kwargs):
        email = request.data['email']
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

class RegisterView(APIView):

    # POST
    # * - required
    # Args:
    # *firstname - first name
    # *lastname - last name
    # *password - password
    # *password_again - password again
    # *email - email
    def post(self, request):
        firstname = request.data.get('firstname')
        lastname = request.data.get('lastname')
        password = request.data.get('password')
        password_again = request.data.get('password_again')
        email = request.data.get('email')

        ### VALIDATION ###

        # Check requried fields
        if not firstname or not lastname or not password \
                or not password_again or not email:
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

        # Validate email
        try:
            validate_email(email)
        except ValidationError:
            return Response({
                "en": "Invalid email",
                "cz": "Neplatný email"
                }, status=400)

        # Check if email is taken
        if User.objects.filter(email=email).exists():
            return Response({
                "en": "Email already taken",
                "cz": "Email je již zabraný"
                }, status=400)

        ### CREATE ###

        # Create user
        user = User(
            first_name=firstname,
            last_name=lastname,
            email=email,
        )
        user.set_password(password)

        # Create main list
        main_list = FavoriteList(
            name="Aktuální",
            is_main=True,
            author=user
        )

        ### SAVE ###

        # Save
        user.save()
        main_list.save()

        return Response(status=201)