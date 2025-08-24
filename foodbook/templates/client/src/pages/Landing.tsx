import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Heart, Users, ChefHat } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  const handleGetStarted = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col items-center justify-center p-4" data-testid="landing-page">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="app-title">Cheffit</h1>
          <p className="text-xl text-gray-600">some text here we'll figure it out later!</p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Swipe to Discover</h3>
                  <p className="text-sm text-gray-600">Find your next favorite recipe with simple swipes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Share Your Recipes</h3>
                  <p className="text-sm text-gray-600">Upload and share your culinary creations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Follow Chefs</h3>
                  <p className="text-sm text-gray-600">Connect with amazing home cooks and chefs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button 
          onClick={handleGetStarted}
          className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90"
          data-testid="button-get-started"
        >
          Get Started
        </Button>

        <p className="text-center text-sm text-gray-500">
          Join thousands of food lovers discovering amazing recipes
        </p>
      </div>
    </div>
  );
}
