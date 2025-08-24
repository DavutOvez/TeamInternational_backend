from django.db import models
from django.contrib.auth.models import User

# Each recipe in the system
class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True, null=True)
    cook_time = models.CharField(max_length=50, blank=True)
    servings = models.CharField(max_length=50, blank=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="easy")
    ingredients = models.TextField()
    instructions = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name="liked_recipes", blank=True)

    def __str__(self):
        return f"{self.title} by {self.created_by.username}"

# Comment model
class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.recipe.title}"

# Optional: swipe tracking (Tinder-style)
class RecipeSwipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    liked = models.BooleanField()  # True = liked, False = skipped
    swiped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')

    def __str__(self):
        return f"{self.user.username} -> {self.recipe.title} ({'Liked' if self.liked else 'Skipped'})"
    

class SavedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_recipes")
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="saved_by_users")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "recipe")  # Aynı kullanıcı aynı tarifi birden fazla kaydedemez

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"