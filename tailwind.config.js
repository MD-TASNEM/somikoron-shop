import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: "#e74c3c", // Brand Red
          dark: "#c0392b", // Darker Red for hover
          light: "#ec7063", // Lighter Red
        },
        secondary: {
          DEFAULT: "#2c3e50", // Dark Navy
          light: "#34495e", // Lighter Navy
          lighter: "#5d6d7b", // Even lighter
        },
        accent: "#f39c12", // Amber/Gold
        success: "#27ae60", // Green
        danger: "#e74c3c", // Red
        warning: "#f39c12", // Amber
        info: "#3498db", // Blue

        // Neutral Grays
        light: {
          bg: "#f8f9fa", // Page background
          card: "#ffffff", // Card background
        },
        gray: {
          light: "#ecf0f1", // Light gray for borders
          medium: "#bdc3c7", // Medium gray
          dark: "#7f8c8d", // Dark gray for text
          darker: "#34495e", // Very dark gray
        },

        // Social
        whatsapp: "#25d366",
        facebook: "#1877f2",
        instagram: "#e1306c",
      },

      fontFamily: {
        sans: ["Hind Siliguri", "system-ui", ...defaultTheme.fontFamily.sans],
        heading: [
          "Hind Siliguri",
          "system-ui",
          ...defaultTheme.fontFamily.sans,
        ],
      },

      borderRadius: {
        xs: "5px",
        sm: "8px",
        md: "10px",
        lg: "15px",
        xl: "20px",
        pill: "50px",
      },

      boxShadow: {
        sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
        card: "0 2px 15px rgba(0, 0, 0, 0.1)",
        hover: "0 10px 30px rgba(0, 0, 0, 0.15)",
        elevation: "0 5px 20px rgba(0, 0, 0, 0.12)",
      },

      spacing: {
        safe: "max(1.5rem, env(safe-area-inset-bottom))",
      },

      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },

      minHeight: {
        touch: "44px", // iOS minimum touch target
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "text-primary",
    "text-secondary",
    "text-accent",
    "border-primary",
    "border-secondary",
    "hover:bg-primary-dark",
    "hover:shadow-hover",
  ],
};
