from .models import User
from .models import APIKey
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class LoginSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["username"] = user.username

        return token


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = (
            "email",
            "username",
            "password",
        )

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
        )


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "date_joined",
        )




class APIKeySerializer(serializers.ModelSerializer):

    class Meta:
        model = APIKey
        fields = (
            "id",
            "name",
            "key",
            "created_at",
            "is_active",
        )

        read_only_fields = (
            "id",
            "key",
            "created_at",
        )