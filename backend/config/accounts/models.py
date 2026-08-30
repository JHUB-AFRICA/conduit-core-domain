import uuid
import secrets
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)


class UserManager(BaseUserManager):
    def create_user(self,email,username,password=None,**extra_fields,):
        if not email:
            raise ValueError("Email is required")

        if not username:
            raise ValueError("Username is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            username=username,
            **extra_fields,
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self,email,username,password=None,**extra_fields,):
        extra_fields.setdefault("is_staff",True,)
        extra_fields.setdefault("is_superuser",True,)
        extra_fields.setdefault("is_active",True,)

        return self.create_user(
            email,
            username,
            password,
            **extra_fields,
        )


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,)

    email = models.EmailField(unique=True,)
    username = models.CharField(max_length=150,unique=True,)

    is_active = models.BooleanField(default=True,)
    is_staff = models.BooleanField(default=False,)

    date_joined = models.DateTimeField(auto_now_add=True,)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email



class APIKey(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,)  
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="api_keys")
    name = models.CharField(max_length=100, default="default")
    key = models.CharField(max_length=64, unique=True, editable=False)
    is_active = models.BooleanField(default=True)

    #rate limit fields
    requests_per_minute = models.IntegerField(default=60)
    daily_quota = models.IntegerField(default=10000)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = secrets.token_hex(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.name}"
    


class APIRequestLog(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,)  
    api_key = models.ForeignKey(APIKey, on_delete=models.CASCADE)
    endpoint = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)