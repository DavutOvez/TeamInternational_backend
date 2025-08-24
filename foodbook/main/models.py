from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    profile_image = models.URLField(blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)

    followers = models.ManyToManyField(User, related_name="following", blank=True)
 
    def __str__(self):
        return self.user.username