import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Clock, Users, Star } from "lucide-react";
import type { RecipeWithCreator } from "@shared/schema";

interface RecipeCardProps {
  recipe: RecipeWithCreator;
  onPass?: () => void;
  onLike?: () => void;
  onSuperLike?: () => void;
  className?: string;
}

export function RecipeCard({ recipe, onPass, onLike, onSuperLike, className = "" }: RecipeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <Card className={`overflow-hidden ${className}`} data-testid={`recipe-card-${recipe.id}`}>
      <div className="relative h-2/3 bg-gray-200">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
            data-testid={`recipe-image-${recipe.id}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <div className="text-4xl">🍽️</div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-4 right-4 flex space-x-2">
          {recipe.cookTime && (
            <span className="bg-black/30 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
              <Clock className="w-3 h-3 inline mr-1" />
              {recipe.cookTime}
            </span>
          )}
          {recipe.servings && (
            <span className="bg-black/30 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
              <Users className="w-3 h-3 inline mr-1" />
              {recipe.servings}
            </span>
          )}
        </div>

        <div className="absolute top-4 left-4">
          <span className={`${getDifficultyColor(recipe.difficulty || "easy")} text-white px-2 py-1 rounded-full text-xs font-medium`}>
            {getDifficultyText(recipe.difficulty || "easy")}
          </span>
        </div>
      </div>
      
      <div className="p-6 h-1/3 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid={`recipe-title-${recipe.id}`}>
            {recipe.title}
          </h2>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid={`recipe-description-${recipe.id}`}>
            {recipe.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border-2 border-gray-200">
            <AvatarImage 
              src={recipe.creator.profileImageUrl || ""} 
              alt={`${recipe.creator.firstName} ${recipe.creator.lastName}`}
            />
            <AvatarFallback>
              {recipe.creator.firstName?.[0]}{recipe.creator.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900 text-sm" data-testid={`creator-name-${recipe.id}`}>
              {recipe.creator.firstName} {recipe.creator.lastName}
            </p>
            <p className="text-gray-500 text-xs" data-testid={`creator-followers-${recipe.id}`}>
              {recipe.creator.followersCount || 0} followers
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-primary hover:text-red-500 transition-colors"
            onClick={onLike}
            data-testid={`like-button-${recipe.id}`}
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
