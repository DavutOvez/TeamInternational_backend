from rest_framework import serializers
from .models import Recipe, Comment

class RecipeSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    creator = serializers.SerializerMethodField()  # ekle

    class Meta:
        model = Recipe
        fields = [
            "id",
            "title",
            "description",
            "image_url", 
            "cook_time",
            "servings",
            "difficulty",
            "ingredients",
            "instructions",
            "created_by",
            "created_at",
            "updated_at",
            "likes_count",
            "creator",  
        ]

    def get_creator(self, obj):
        profile = getattr(obj.created_by, "profile", None)
        if profile:
            return {
                "firstName": profile.first_name or obj.created_by.first_name,
                "lastName": profile.last_name or obj.created_by.last_name,
                "profileImageUrl": profile.profile_image.url if profile.profile_image else None,
                "followersCount": profile.followers.count() if profile else 0,
            }
        return {
            "firstName": obj.created_by.first_name,
            "lastName": obj.created_by.last_name,
            "profileImageUrl": None,
            "followersCount": 0,
        }

class CreateRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = [
            "title",
            "description",
            "image_url", 
            "cook_time",
            "servings",
            "difficulty",
            "ingredients",
            "instructions",
        ]