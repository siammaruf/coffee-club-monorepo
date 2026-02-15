import { useState } from "react";
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
  IoEggOutline,
  IoChevronDown,
  IoCheckmark
} from "react-icons/io5";
import { Button } from "./button";
import { cn } from "~/lib/utils";

type IconComponent = React.ComponentType<{ className?: string }>;

export const iconOptions: Array<{ value: string; label: string; icon: IconComponent }> = [
  { value: "cafe-outline", label: "Coffee", icon: IoCafeOutline },
  { value: "restaurant-outline", label: "Restaurant", icon: IoRestaurantOutline },
  { value: "cart-outline", label: "Cart", icon: IoCartOutline },
  { value: "pizza-outline", label: "Pizza", icon: IoPizzaOutline },
  { value: "wine-outline", label: "Wine", icon: IoWineOutline },
  { value: "beer-outline", label: "Beer", icon: IoBeerOutline },
  { value: "fast-food-outline", label: "Fast Food", icon: IoFastFoodOutline },
  { value: "fish-outline", label: "Fish", icon: IoFishOutline },
  { value: "ice-cream-outline", label: "Ice Cream", icon: IoIceCreamOutline },
  { value: "nutrition-outline", label: "Healthy Food", icon: IoNutritionOutline },
  { value: "egg-outline", label: "Breakfast", icon: IoEggOutline },
];

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function IconSelector({ value, onChange, placeholder = "Select an icon", className }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedIcon = iconOptions.find(icon => icon.value === value);
  const IconComponent = selectedIcon?.icon;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between h-11",
          !value && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          <span>{selectedIcon?.label || placeholder}</span>
        </div>
        <IoChevronDown className="h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="grid grid-cols-3 gap-1 p-2">
            {iconOptions.map((iconOption) => {
              const IconComp = iconOption.icon;
              const isSelected = value === iconOption.value;

              return (
                <button
                  key={iconOption.value}
                  type="button"
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-md text-xs hover:bg-gray-100 transition-colors relative",
                    isSelected && "bg-blue-50 text-blue-600 border border-blue-200"
                  )}
                  onClick={() => {
                    onChange(iconOption.value);
                    setIsOpen(false);
                  }}
                >
                  <IconComp className="h-5 w-5" />
                  <span className="truncate w-full text-center">{iconOption.label}</span>
                  {isSelected && <IoCheckmark className="h-3 w-3 absolute top-1 right-1" />}
                </button>
              );
            })}
            {/* Browse Icon Library Option */}
            <a
              href="https://ionic.io/ionicons"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 p-3 rounded-md text-xs hover:bg-blue-50 transition-colors border border-dashed border-blue-200 text-blue-600"
              style={{ gridColumn: "span 3" }}
            >
              <IoChevronDown className="h-5 w-5" />
              <span className="truncate w-full text-center font-semibold">Browse Icon Library</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
