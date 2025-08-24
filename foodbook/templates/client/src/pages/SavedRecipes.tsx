import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Clock, Users } from "lucide-react";
import { useLocation } from "wouter";
import type { RecipeWithCreator } from "@shared/schema";

export default function SavedRecipes() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { 
    data: savedRecipes = [], 
    isLoading: recipesLoading,
    error: recipesError 
  } = useQuery<RecipeWithCreator[]>({
    queryKey: ["/api/users", user?.id, "saved-recipes"],
    enabled: !!user?.id,
  });

  const handleCreateClick = () => {
    setLocation("/create");
  };

  const handleRecipeClick = (recipeId: string) => {
  };

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (recipesError && isUnauthorizedError(recipesError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [recipesError, toast]);

  if (authLoading || recipesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Loading saved recipes...</p>
          </div>
        </div>
        <BottomNav onCreateClick={handleCreateClick} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" data-testid="saved-recipes-page">
      <Header />
      
      <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold" data-testid="saved-recipes-title">Saved Recipes</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {savedRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Recipes</h3>
              <p className="text-gray-600 mb-6">Start swiping right on recipes you love!</p>
              <Button 
                onClick={() => setLocation("/")}
                data-testid="discover-recipes-button"
              >
                Discover Recipes
              </Button>
            </div>
          ) : (
            savedRecipes.map((recipe: RecipeWithCreator) => (
              <Card 
                key={recipe.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecipeClick(recipe.id)}
                data-testid={`saved-recipe-${recipe.id}`}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      {recipe.imageUrl ? (
                        <img 
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover rounded-l-lg"
                          data-testid={`saved-recipe-image-${recipe.id}`}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 rounded-l-lg flex items-center justify-center">
                          <div className="text-2xl">🍽️</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1" data-testid={`saved-recipe-title-${recipe.id}`}>
                        {recipe.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage 
                            src={recipe.creator.profileImageUrl || ""} 
                            alt={`${recipe.creator.firstName} ${recipe.creator.lastName}`}
                          />
                          <AvatarFallback className="text-xs">
                            {recipe.creator.firstName?.[0]}{recipe.creator.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-gray-600 text-sm" data-testid={`saved-recipe-creator-${recipe.id}`}>
                          By {recipe.creator.firstName} {recipe.creator.lastName}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        {recipe.cookTime && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {recipe.cookTime}
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {recipe.servings}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav onCreateClick={handleCreateClick} />
    </div>
  );
}
