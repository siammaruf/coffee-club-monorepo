import { iconOptions } from "~/components/ui/icon-selector";

type IconComponent = React.ComponentType<{ className?: string }>;

export function getCategoryIcon(iconName: string): IconComponent | null {
  const found = iconOptions.find(opt => opt.value === iconName);
  return found?.icon ?? null;
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
