from rest_framework import serializers

from users.models import User
from eduklub.models import (FavoriteList,)


class UserSerializer(serializers.ModelSerializer):
    main_list = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "profile_image",
                  "is_staff", "main_list",)
        read_only_fields = ("id", "email", "profile_image", "is_staff",)

    def get_main_list(self, obj):
        try: 
            return FavoriteList.objects.get(author=obj, is_main=True).pk
        except FavoriteList.DoesNotExist:
            return None


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "profile_image",)
        read_only_fields = ("id", "first_name", "last_name", "profile_image",)
