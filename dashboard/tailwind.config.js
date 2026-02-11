// Add this to your existing tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        steam: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'translateY(-5px) scale(1)', opacity: '0.7' },
          '100%': { transform: 'translateY(-10px) scale(1.2)', opacity: '0' },
        },
      },
      animation: {
        steam: 'steam 2s ease-out infinite',
      },
    },
  },
};