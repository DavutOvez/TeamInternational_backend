from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count

from recipes.models import Recipe

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "email": user.email
            }
        })
    return Response({"error": "Invalid credentials"}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    
    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)
    
    user = User.objects.create_user(username=username, password=password)
    return Response({"message": "User created successfully"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user
    profile = getattr(user, "profile", None)

    # Recipes
    recipes = Recipe.objects.filter(created_by=user).annotate(
        likes_count=Count('likes')
    ).values(
        "id", "title", "description", "image_url", "cook_time", "servings", "likes_count"
    )
    

    # Followers / Following
    followers = profile.followers.all().values("id", "username") if profile else []
    following = User.objects.filter(profile__followers=user).values("id", "username")
    

    recipes_data = [
        {
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "imageUrl": r["image_url"],
            "cookTime": r["cook_time"],
            "servings": r["servings"],
            "likesCount": r["likes_count"]
        }
        for r in recipes
    ]

    return Response({
        "id": user.id,
        "username": user.username,
        "firstName": getattr(profile, "first_name", ""),
        "lastName": getattr(profile, "last_name", ""),
        "email": user.email,
        "bio": getattr(profile, "bio", ""),
        "profileImageUrl": getattr(profile, "profile_image_url", ""),
        "recipes": recipes_data,
        "followers": list(followers),
        "following": list(following),
    })



from django.contrib.auth.models import User
from django.http import JsonResponse, Http404
from django.views.decorators.http import require_GET

@require_GET
def followers_list(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise Http404("User not found")

    followers = user.profile.followers.all().values("id", "username")
    return JsonResponse(list(followers), safe=False)


@require_GET
def following_list(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise Http404("User not found")

    following = User.objects.filter(profile__followers=user).values("id", "username")
    return JsonResponse(list(following), safe=False)


from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def upload_image(request):
#     file_obj = request.FILES.get("image")
#     if not file_obj:
#         return Response({"error": "No file provided"}, status=400)
#     # Dosyayı kaydet
#     recipe = Recipe.objects.create(image=file_obj, created_by=request.user)
#     return Response({"image_url": recipe.image.url})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_recipes(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    recipes = Recipe.objects.filter(created_by=user).annotate(
        likes_count=Count("likes")
    ).values(
        "id", "title", "description", "image_url", "cook_time", "servings", "likes_count"
    )

    recipes_data = [
        {
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "imageUrl": r["image_url"],
            "cookTime": r["cook_time"],
            "servings": r["servings"],
            "likesCount": r["likes_count"],
        }
        for r in recipes
    ]

    return Response(recipes_data)