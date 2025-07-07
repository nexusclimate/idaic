// Color configuration for IDAIC Portal
export const colors = {
  // Brand Colors
  primary: {
    orange: '#FF9900',
    orangeHover: 'rgba(255, 153, 0, 0.1)', // 10% opacity
    orangeActive: 'rgba(255, 153, 0, 0.15)', // 15% opacity
  },
  
  // Background Colors
  background: {
    sidebar: '#18181b', // zinc-950
    main: '#f9fafb', // gray-50
    white: '#ffffff',
  },
  
  // Text Colors
  text: {
    primary: '#18181b', // zinc-950
    secondary: '#6b7280', // gray-500
    white: '#ffffff',
    sidebar: '#fafafa', // zinc-100
  },
  
  // Status Colors
  status: {
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
  },
  
  // Border Colors
  border: {
    light: '#e5e7eb', // gray-200
    medium: '#d1d5db', // gray-300
    dark: '#9ca3af', // gray-400
  }
};

// Helper function to get color with opacity
export const getColorWithOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Pre-computed color variations
export const colorVariations = {
  orange: {
    light: getColorWithOpacity(colors.primary.orange, 0.1),
    medium: getColorWithOpacity(colors.primary.orange, 0.15),
    dark: getColorWithOpacity(colors.primary.orange, 0.2),
  }
};

// Add font family for consistency
export const font = {
  primary: 'Inter, sans-serif',
};

// Add form focus color for consistent use
export const form = {
  focus: colors.primary.orange,
}; 