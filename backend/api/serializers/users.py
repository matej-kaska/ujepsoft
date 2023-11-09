from rest_framework import serializers
from users.models import User
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("id", "email", "is_staff",)
        read_only_fields = ("id", "email", "is_staff",)


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email",)
        read_only_fields = ("id", "email",)
