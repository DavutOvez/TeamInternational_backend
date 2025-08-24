from django.urls import path
from .views import *

urlpatterns = [
    path('', list_recipes, name='list_recipes'),
    path('create/', create_recipe, name='create_recipe'),
    path('discover/', discover_recipes, name='discover_recipes'),
    path('<int:recipe_id>/interact/', interact_recipe),
    path('<int:recipe_id>/save/', save_recipe, name='save_recipe'),
    path('<int:user_id>/saved-recipes/', saved_recipes, name='saved_recipes'),
]