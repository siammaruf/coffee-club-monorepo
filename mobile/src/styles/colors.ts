// Color palette based on the CoffeeClubGo Design Guidelines
// Use NativeWind/Tailwind classes in components; these are for programmatic use.

export const colors = {
    // Primary Colors
    primary: {
        red: '#EF4444',        // red-500: Primary buttons, active states, badges, CTAs
        orange: '#F97316',     // orange-500: Tab bar active, accents, highlights
        green: '#4CAF50',      // Custom: Primary button variant (Button component)
        emerald: '#10B981',    // emerald-600: Success states, completed status
        blue: '#2563EB',       // blue-600: Links, secondary actions, info
        amber: '#F59E0B',      // amber-500: Icons, warnings, star ratings
    },

    // Status Colors
    status: {
        pending: {
            background: '#FEF9C3',    // yellow-100
            text: '#854D0E',          // yellow-800
            border: '#FEF08A',        // yellow-200
        },
        completed: {
            background: '#DCFCE7',    // green-100
            text: '#166534',          // green-800
            border: '#BBF7D0',        // green-200
        },
        cancelled: {
            background: '#FEE2E2',    // red-100
            text: '#991B1B',          // red-800
            border: '#FECACA',        // red-200
        },
        preparing: {
            background: '#DBEAFE',    // blue-100
            text: '#1E40AF',          // blue-800
            border: '#BFDBFE',        // blue-200
        },
    },

    // Table Status Colors
    table: {
        available: '#22C55E',     // green-500
        occupied: '#EF4444',      // red-500
        reserved: '#3B82F6',      // blue-500
    },

    // Feature Background Tints
    feature: {
        orders: '#FEF2F2',        // red-50
        customers: '#EFF6FF',     // blue-50
        reports: '#F0FDF4',       // green-50
        tables: '#FFFBEB',        // amber-50
        products: '#F3F4F6',      // gray-100
        expenses: '#FDF2F8',      // pink-50
    },

    // Neutral Colors
    neutral: {
        screenBackground: '#F9FAFB',   // gray-50
        cardBackground: '#FFFFFF',     // white
        titleBarBackground: '#F3FAF9', // custom
        textPrimary: '#1F2937',        // gray-800
        textSecondary: '#6B7280',      // gray-500
        textPlaceholder: '#9CA3AF',    // gray-400
        border: '#E5E7EB',            // gray-200
        inputBackground: '#F9FAFB',    // gray-50
    },

    // Tab Navigation
    tab: {
        active: '#F97316',       // orange-500
        inactive: '#9CA3AF',     // gray-400
    },

    // Refresh Control
    refresh: '#EF4444',          // red-500
} as const;
