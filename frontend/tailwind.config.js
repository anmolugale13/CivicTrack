/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16213E",
          50: "#EEF0F5",
          100: "#D4D8E4",
          300: "#7C88AC",
          500: "#3A4874",
          700: "#232F52",
          900: "#16213E",
          950: "#0E1629",
        },
        mist: {
          DEFAULT: "#F1F3F0",
          100: "#FAFBF9",
          200: "#EEF1EC",
          300: "#DDE2D9",
        },
        amber: {
          DEFAULT: "#E8A93C",
          100: "#FBEACB",
          400: "#EFB94F",
          600: "#C98A21",
        },
        brick: {
          DEFAULT: "#B33F3F",
          100: "#F3D9D6",
          600: "#963530",
        },
        moss: {
          DEFAULT: "#1F7A5C",
          100: "#D7EAE1",
          600: "#175E46",
        },
        slate: {
          DEFAULT: "#4A5568",
          400: "#7C8698",
          600: "#4A5568",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(22,33,62,0.06)",
        raised: "0 8px 24px rgba(22,33,62,0.12)",
      },
    },
  },
  plugins: [],
};
