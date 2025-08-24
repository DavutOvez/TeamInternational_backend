from django.contrib import admin
from .models import*
# Register your models here.
admin.site.register(Recipe)
admin.site.register(RecipeSwipe)
admin.site.register(Comment)
admin.site.register(SavedRecipe)