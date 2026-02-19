// Typography constants based on the CoffeeClubGo Design Guidelines
// Use NativeWind/Tailwind classes in components; these are for programmatic use.

export const typography = {
    // Font Sizes (matching Tailwind text-* classes)
    size: {
        xs: 12,       // text-xs: Labels, badges, chip text
        sm: 14,       // text-sm: Secondary info, descriptions
        base: 16,     // text-base: Normal text, body
        lg: 18,       // text-lg: Screen titles, modal titles
        xl: 20,       // text-xl: Welcome messages
        tabLabel: 11, // text-[11px]: Bottom tab labels
    },

    // Font Weights
    weight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Line Heights
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

// Tailwind class combinations for quick reference
// XL heading:   text-xl font-bold
// LG heading:   text-lg font-bold
// Base heading:  text-base font-semibold
// Body:         text-base
// Small:        text-sm
// XS:           text-xs
// Tab label:    text-[11px] font-medium
