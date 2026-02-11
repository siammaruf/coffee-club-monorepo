import { 
  IoCafeOutline,
  IoRestaurantOutline,
  IoCartOutline,
  IoPizzaOutline,
  IoWineOutline,
  IoBeerOutline,
  IoFastFoodOutline,
  IoFishOutline,
  IoIceCreamOutline,
  IoNutritionOutline,
  IoEggOutline
} from "react-icons/io5";
import * as IoIcons from "react-icons/io5";

type IconComponent = React.ComponentType<{ className?: string }>;

const iconMap: Record<string, IconComponent> = {
  "cafe-outline": IoCafeOutline,
  "restaurant-outline": IoRestaurantOutline,
  "cart-outline": IoCartOutline,
  "pizza-outline": IoPizzaOutline,
  "wine-outline": IoWineOutline,
  "beer-outline": IoBeerOutline,
  "fast-food-outline": IoFastFoodOutline,
  "fish-outline": IoFishOutline,
  "ice-cream-outline": IoIceCreamOutline,
  "nutrition-outline": IoNutritionOutline,
  "egg-outline": IoEggOutline,
};

// Convert kebab-case to PascalCase for dynamic icon lookup
function formatIconName(iconName: string): string {
  return iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function getCategoryIcon(iconName: string): IconComponent | null {
  // First, try the predefined icon map
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }
  
  // Then try dynamic lookup for any Ionicon
  try {
    const formattedName = `Io${formatIconName(iconName)}`;
    const DynamicIcon = (IoIcons as any)[formattedName];
    if (DynamicIcon && typeof DynamicIcon === 'function') {
      return DynamicIcon;
    }
  } catch (error) {
    console.warn(`Icon "${iconName}" not found in Ionicons`);
  }
  
  return null;
}

export function CategoryIcon({ 
  iconName, 
  className = "h-4 w-4" 
}: { 
  iconName: string; 
  className?: string; 
}) {
  const IconComponent = getCategoryIcon(iconName);
  
  if (!IconComponent) {
    // Fallback to default icon or show icon name as text
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200 rounded text-xs text-gray-600 font-mono`}>
        {iconName.split('-')[0].substring(0, 2).toUpperCase()}
      </div>
    );
  }
  
  return <IconComponent className={className} />;
}
