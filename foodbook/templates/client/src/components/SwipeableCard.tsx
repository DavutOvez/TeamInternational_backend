import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { RecipeCard } from "./RecipeCard";
import type { RecipeWithCreator } from "@shared/schema";

interface SwipeableCardProps {
  recipe: RecipeWithCreator;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSuperLike?: () => void;
  isTop?: boolean;
  index: number;
}

export function SwipeableCard({ 
  recipe, 
  onSwipeLeft, 
  onSwipeRight, 
  onSuperLike,
  isTop = false,
  index 
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const [exitX, setExitX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    const swipeThreshold = 100;
    
    if (offset > swipeThreshold || velocity > 500) {
      setExitX(1000);
      onSwipeRight?.();
    } else if (offset < -swipeThreshold || velocity < -500) {
      setExitX(-1000);
      onSwipeLeft?.();
    }
  };

  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);

  return (
    <motion.div
      ref={cardRef}
      style={{
        x,
        rotate,
        opacity,
        scale: isTop ? scale : 0.95,
        zIndex: isTop ? 10 : index,
      }}
      className="absolute inset-4"
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-testid={`swipeable-card-${recipe.id}`}
    >
      <div className="relative h-full">
        <motion.div
          className="absolute top-1/2 left-8 transform -translate-y-1/2 z-20 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-xl"
          style={{
            opacity: useTransform(x, [0, 100], [0, 1]),
            scale: useTransform(x, [0, 100], [0.8, 1]),
          }}
        >
          LIKE
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 right-8 transform -translate-y-1/2 z-20 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xl"
          style={{
            opacity: useTransform(x, [-100, 0], [1, 0]),
            scale: useTransform(x, [-100, 0], [1, 0.8]),
          }}
        >
          PASS
        </motion.div>

        <RecipeCard
          recipe={recipe}
          onLike={onSwipeRight}
          onPass={onSwipeLeft}
          onSuperLike={onSuperLike}
          className="h-full shadow-xl"
        />
      </div>
    </motion.div>
  );
}
