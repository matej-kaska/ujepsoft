from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.core.files.uploadedfile import InMemoryUploadedFile

from api.serializers.users import UserSerializer, UserPublicSerializer

from users.models import User
from eduklub.models import TeachingUnit

from PIL import Image
import io
import hashlib



class UserViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def retrieve(self, request):
        user = request.user
        serializer = self.serializer_class(user)
        return Response(serializer.data)

    def partial_update(self, request):
        user = request.user
        serializer = self.serializer_class(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class UserPublicRetrieveView(generics.RetrieveAPIView):
    serializer_class = UserPublicSerializer
    queryset = UserSerializer.Meta.model.objects.all()


class UserChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user

        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        new_password_again = request.data.get('new_password_again')

        if not old_password or not new_password or not new_password_again:
            return Response({
                "en": "All fields are required",
                "cz": "Všechna pole jsou povinná"
                }, status=400)

        if len(new_password) < 8:
            return Response({
                "en": "New password must be at least 8 characters long",
                "cz": "Nové heslo musí být alespoň 8 znaků dlouhé"
                }, status=400)

        if new_password != new_password_again:
            return Response({
                "en": "New passwords do not match",
                "cz": "Nová hesla se neshodují"
                }, status=400)

        if not user.check_password(old_password):
            return Response({
                "en": "Old password is incorrect",
                "cz": "Staré heslo je nesprávné"
                }, status=400)

        user.set_password(new_password)
        user.save()

        return Response({
            "en": "Password changed successfully",
            "cz": "Heslo bylo úspěšně změněno"
            }, status=200)

class UserChangeProfileImageView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user

        file = request.data.get('profile_image')

        if not file:
            return Response({
                "en": "No image was sent",
                "cz": "Nebyl odeslán žádný obrázek"
                }, status=400)

        file_name = file.name.lower()
        if not file_name.endswith(".jpg") and not file_name.endswith(".jpeg") and not file_name.endswith(".png"):
            return Response({
                "en": "Image must be in .jpg, .jpeg or .png format",
                "cz": "Obrázek musí být ve formátu .jpg, .jpeg nebo .png"
                }, status=400)

        # max size 1MB
        if file.size > 1000000:
            return Response({
                "en": "Image is too large",
                "cz": "Obrázek je příliš velký"
                }, status=400)

        try:
            img = Image.open(file)
        except Exception:
            return Response({
                "en": "Image is not valid",
                "cz": "Obrázek není platný"
                }, status=400)



        # resize image to 64x64
        img = img.resize((64, 64))

        img_io = io.BytesIO()
        if file_name.endswith(".png"):
            img.save(img_io, format='PNG')
        else:
            img.save(img_io, format='JPEG')

        file_name_hash = hashlib.md5(img_io.getvalue()).hexdigest()
        file_name = f"{file_name_hash}.{file_name.split('.')[-1]}"

        new_profile_image = InMemoryUploadedFile(
            img_io,
            "profile_image",
            file_name,
            file.content_type,
            file.size,
            file.charset,
            )

        print("Setting profile image", user.email)
        user.profile_image = new_profile_image
        user.save()

        return Response(status=200)
    
class UserTest401View(APIView):
    # if the user is not authenticated, this view will return 401
    # if the user is authenticated, this view will log the user out and return 401
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        request.user.auth_token.delete()
        return Response(status=401)
 
class UserDeleteView(APIView):
    permission_classes = (IsAuthenticated,)

    def _hide_all_user_data(self, user):
        teaching_units = TeachingUnit.objects.filter(author=user)
        for teaching_unit in teaching_units:
            teaching_unit.is_hidden = True
            teaching_unit.author = None
            teaching_unit.save()

    def post(self, request, *args, **kwargs):
        # Get user
        try:
            user = User.objects.get(pk=kwargs['pk'])
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if request.user.is_staff and request.user != user:
            self._hide_all_user_data(user)
            user.delete()
        else:
            password = request.data.get('password', None)
            if not password:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            # Check if user is deleting himself
            if user != request.user:
                return Response(status=status.HTTP_403_FORBIDDEN)

            # Check if password is correct
            if not user.check_password(password):
                return Response(status=status.HTTP_403_FORBIDDEN)

            # Delete user
            self._hide_all_user_data(user)
            user.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)