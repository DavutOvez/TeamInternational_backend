import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertRecipeSchema } from "@shared/schema";
import { Camera, X } from "lucide-react";
import { useLocation } from "wouter";
import type { UploadResult } from "@uppy/core";
import { z } from "zod";

const createRecipeSchema = insertRecipeSchema.extend({
  imageUrl: z.string().optional(),
});

type CreateRecipeForm = z.infer<typeof createRecipeSchema>;

export default function CreateRecipe() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  const form = useForm<CreateRecipeForm>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      title: "",
      description: "",
      cookTime: "",
      servings: "",
      difficulty: "easy",
      ingredients: "",
      instructions: "",
    },
  });

  const createRecipeMutation = useMutation({
    mutationFn: async (data: CreateRecipeForm & { imageUrl?: string }) => {
      return await apiRequest("POST", "/api/recipes", data);
    },
    onSuccess: () => {
      toast({
        title: "Recipe Created!",
        description: "Your recipe has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      setLocation("/");
    },
    onError: (error: Error) => {
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
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        throw error;
      }
      toast({
        title: "Upload Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      setUploadedImageUrl(uploadedFile.uploadURL || "");
      toast({
        title: "Image Uploaded",
        description: "Your recipe image has been uploaded successfully.",
      });
    }
  };

  const onSubmit = (data: CreateRecipeForm) => {
    createRecipeMutation.mutate({
      ...data,
      difficulty: selectedDifficulty,
      imageUrl: uploadedImageUrl,
    });
  };

  const handleCreateClick = () => {
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <BottomNav onCreateClick={handleCreateClick} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header />
        <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to create recipes.</p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Log In
            </Button>
          </div>
        </div>
        <BottomNav onCreateClick={handleCreateClick} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50" data-testid="create-recipe-page">
      <Header />
      
      <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            data-testid="close-create-button"
          >
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">Create Recipe</h2>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createRecipeMutation.isPending}
            className="font-semibold"
            data-testid="submit-recipe-button"
          >
            {createRecipeMutation.isPending ? "Publishing..." : "Post"}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              {uploadedImageUrl ? (
                <div className="relative">
                  <img 
                    src={uploadedImageUrl} 
                    alt="Recipe preview"
                    className="w-full h-48 object-cover rounded-xl"
                    data-testid="uploaded-image-preview"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => setUploadedImageUrl("")}
                    data-testid="remove-image-button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={10485760} // 10MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary transition-colors"
                >
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Add recipe photo</p>
                    <p className="text-gray-400 text-sm">Tap to upload from gallery</p>
                  </div>
                </ObjectUploader>
              )}
            </CardContent>
          </Card>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Recipe Name</Label>
              <Input
                id="title"
                placeholder="What's cooking?"
                {...form.register("title")}
                data-testid="input-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your recipe..."
                rows={3}
                {...form.register("description")}
                data-testid="input-description"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cookTime">Cook Time</Label>
                <Input
                  id="cookTime"
                  placeholder="25 min"
                  {...form.register("cookTime")}
                  data-testid="input-cook-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  placeholder="4"
                  {...form.register("servings")}
                  data-testid="input-servings"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="flex space-x-3">
                {["easy", "medium", "hard"].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={selectedDifficulty === level ? "default" : "outline"}
                    className={`flex-1 ${
                      selectedDifficulty === level 
                        ? "bg-green-500 text-white border-green-500" 
                        : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-500"
                    }`}
                    onClick={() => setSelectedDifficulty(level as "easy" | "medium" | "hard")}
                    data-testid={`difficulty-${level}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                placeholder="List your ingredients..."
                rows={4}
                {...form.register("ingredients")}
                data-testid="input-ingredients"
              />
              {form.formState.errors.ingredients && (
                <p className="text-sm text-red-500">{form.formState.errors.ingredients.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Step by step instructions..."
                rows={4}
                {...form.register("instructions")}
                data-testid="input-instructions"
              />
              {form.formState.errors.instructions && (
                <p className="text-sm text-red-500">{form.formState.errors.instructions.message}</p>
              )}
            </div>
          </form>
        </div>
      </div>

      <BottomNav onCreateClick={handleCreateClick} />
    </div>
  );
}
