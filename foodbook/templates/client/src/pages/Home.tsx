import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SwipeableCard } from "@/components/SwipeableCard";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { X, Heart, Star } from "lucide-react";
import type { RecipeWithCreator } from "@shared/schema";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { 
    data: recipes = [], 
    isLoading: recipesLoading,
    error: recipesError 
  } = useQuery<RecipeWithCreator[]>({
    queryKey: ["/api/recipes/discover"],
    enabled: !!user,
  });

  const interactMutation = useMutation({
    mutationFn: async ({ recipeId, liked, superLiked }: { 
      recipeId: string; 
      liked: boolean; 
      superLiked?: boolean 
    }) => {
      await apiRequest("POST", `/api/recipes/${recipeId}/interact`, {
        liked,
        superLiked: superLiked || false,
      });
    },
    onSuccess: () => {
      setCurrentIndex(prev => prev + 1);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to record your choice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      await apiRequest("POST", `/api/recipes/${recipeId}/save`);
    },
    onSuccess: () => {
      toast({
        title: "Recipe Saved!",
        description: "Added to your saved recipes.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePass = () => {
    if (currentIndex < recipes.length) {
      const recipe = recipes[currentIndex];
      interactMutation.mutate({
        recipeId: recipe.id,
        liked: false,
      });
    }
  };

  const handleLike = () => {
    if (currentIndex < recipes.length) {
      const recipe = recipes[currentIndex];
      interactMutation.mutate({
        recipeId: recipe.id,
        liked: true,
      });
      saveMutation.mutate(recipe.id);
    }
  };

  const handleSuperLike = () => {
    if (currentIndex < recipes.length) {
      const recipe = recipes[currentIndex];
      interactMutation.mutate({
        recipeId: recipe.id,
        liked: true,
        superLiked: true,
      });
      saveMutation.mutate(recipe.id);
    }
  };

  const handleCreateClick = () => {
    setLocation("/create");
  };

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
            <p className="text-gray-600">Loading delicious recipes...</p>
          </div>
        </div>
        <BottomNav onCreateClick={handleCreateClick} />
      </div>
    );
  }

  if (currentIndex >= recipes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900">No More Recipes!</h2>
            <p className="text-gray-600">You've seen all available recipes. Check back later for more!</p>
            <Button 
              onClick={() => {
                setCurrentIndex(0);
                queryClient.invalidateQueries({ queryKey: ["/api/recipes/discover"] });
              }}
              className="mt-4"
              data-testid="refresh-recipes-button"
            >
              Refresh
            </Button>
          </div>
        </div>
        <BottomNav onCreateClick={handleCreateClick} />
      </div>
    );
  }

  const currentRecipe = recipes[currentIndex];
  const nextRecipe = recipes[currentIndex + 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" data-testid="home-page">
      <Header />
      
      <main className="max-w-md mx-auto relative h-[calc(100vh-140px)] overflow-hidden">
        <div className="absolute inset-0 p-4" data-testid="swipe-container">
          <AnimatePresence>
            {nextRecipe && (
              <motion.div
                key={`${nextRecipe.id}-bg`}
                className="absolute inset-4"
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 0.95, opacity: 0.5 }}
                style={{ zIndex: 1 }}
              >
                <SwipeableCard
                  recipe={nextRecipe}
                  isTop={false}
                  index={1}
                />
              </motion.div>
            )}

            {currentRecipe && (
              <SwipeableCard
                key={currentRecipe.id}
                recipe={currentRecipe}
                onSwipeLeft={handlePass}
                onSwipeRight={handleLike}
                onSuperLike={handleSuperLike}
                isTop={true}
                index={2}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-4 border-gray-200 hover:border-red-300 transition-all transform hover:scale-110 bg-white"
            onClick={handlePass}
            disabled={interactMutation.isPending}
            data-testid="pass-button"
          >
            <X className="text-red-500 w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full border-4 border-gray-200 hover:border-blue-300 transition-all transform hover:scale-110 bg-white"
            onClick={handleSuperLike}
            disabled={interactMutation.isPending}
            data-testid="super-like-button"
          >
            <Star className="text-blue-500 w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-4 border-gray-200 hover:border-green-300 transition-all transform hover:scale-110 bg-white"
            onClick={handleLike}
            disabled={interactMutation.isPending}
            data-testid="like-button"
          >
            <Heart className="text-green-500 w-6 h-6" />
          </Button>
        </div>
      </main>

      <BottomNav onCreateClick={handleCreateClick} />
    </div>
  );
}
