from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import RecipeSerializer, CreateRecipeSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_recipe(request):
    print("Incoming data:", request.data) 
    serializer = CreateRecipeSerializer(data=request.data)
    if serializer.is_valid():
        recipe = serializer.save(created_by=request.user)
        return Response(RecipeSerializer(recipe).data, status=201)
    print("Errors:", serializer.errors)  
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def list_recipes(request):
    recipes = Recipe.objects.all().order_by('-created_at')
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def discover_recipes(request):
    swiped_ids = RecipeSwipe.objects.filter(user=request.user).values_list("recipe_id", flat=True)

    recipes = Recipe.objects.exclude(id__in=swiped_ids).order_by("?")[:10] 

    serializer = RecipeSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def interact_recipe(request, recipe_id):
    user = request.user
    liked = request.data.get('liked', False)       
    super_liked = request.data.get('superLiked', False) 

    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return Response({"detail": "Recipe not found"}, status=status.HTTP_404_NOT_FOUND)

    swipe, created = RecipeSwipe.objects.get_or_create(
        user=user,
        recipe=recipe,
        defaults={'liked': liked}
    )

    if not created:
        swipe.liked = liked
        swipe.save()

    recipe.likes.set(RecipeSwipe.objects.filter(recipe=recipe, liked=True).values_list('user', flat=True))
    recipe.save()

    return Response({"detail": "Interaction recorded"}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_recipe(request, recipe_id):
    try:
        recipe = Recipe.objects.get(pk=recipe_id)
    except Recipe.DoesNotExist:
        return JsonResponse({"error": "Recipe not found"}, status=404)

    saved, created = SavedRecipe.objects.get_or_create(user=request.user, recipe=recipe)
    if not created:
        return JsonResponse({"message": "Recipe already saved"}, status=200)

    return JsonResponse({"message": "Recipe saved successfully"}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request, user_id):
    if request.user.id != user_id:
        return Response({"error": "Unauthorized"}, status=403)
    
    saved_recipes = request.user.saved_recipes.select_related('recipe', 'recipe__created_by').all()
    
    serialized = [
        {
            "id": r.id,
            "title": r.recipe.title,
            "description": r.recipe.description,
            "imageUrl": r.recipe.image_url,
            "cookTime": r.recipe.cook_time,
            "servings": r.recipe.servings,
            "difficulty": r.recipe.difficulty,
            "creator": {
                "id": r.recipe.created_by.id,
                "firstName": r.recipe.created_by.first_name,
                "lastName": r.recipe.created_by.last_name,
                "profileImageUrl": getattr(r.recipe.created_by, 'profile_image', None).url if getattr(r.recipe.created_by, 'profile_image', None) else None
            }
        }
        for r in saved_recipes
    ]
    return Response(serialized)