/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WhatsApp-like colors
        chat: {
          bg: '#e5ddd5',
          header: '#075e54',
          headerLight: '#128c7e',
          incoming: '#ffffff',
          outgoing: '#dcf8c6',
          typing: '#ffffff',
          text: '#303030',
          timestamp: '#667781',
          link: '#027eb5',
        },
        // Action colors
        action: {
          danger: '#dc2626',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#10b981',
        },
        // Role colors
        role: {
          aggressor: '#ef4444',
          victim: '#8b5cf6',
          neutral: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'typing-dot': 'typingDot 1.4s infinite ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
