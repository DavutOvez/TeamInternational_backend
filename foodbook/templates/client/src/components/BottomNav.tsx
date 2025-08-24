import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Flame, Bookmark, PlusCircle, User } from "lucide-react";

interface BottomNavProps {
  onCreateClick?: () => void;
}

export function BottomNav({ onCreateClick }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    {
      id: "discover",
      label: "Discover",
      icon: Flame,
      path: "/",
      active: location === "/",
    },
    {
      id: "saved",
      label: "Saved",
      icon: Bookmark,
      path: "/saved",
      active: location === "/saved",
    },
    {
      id: "create",
      label: "Create",
      icon: PlusCircle,
      path: "/create",
      active: location === "/create",
      onClick: onCreateClick,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
      active: location === "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" data-testid="bottom-navigation">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <Button
                variant="ghost"
                className={`flex flex-col items-center py-2 px-3 h-auto ${
                  item.active 
                    ? "text-primary" 
                    : "text-gray-400 hover:text-primary transition-colors"
                }`}
                onClick={item.onClick}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="text-xl mb-1 w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );

            if (item.onClick) {
              return (
                <div key={item.id}>
                  {content}
                </div>
              );
            }

            return (
              <Link key={item.id} href={item.path}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
