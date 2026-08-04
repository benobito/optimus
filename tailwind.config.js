/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#FFF0F5",       // soft blush-pink page base
        inktext: "#5B3A4A",   // deep plum, main body text on pink
        panel: "#FFFFFF",     // card surface (white, pops on pink)
        panel2: "#FFE3EE",    // raised surface, candy pink
        line: "#FBC2D9",      // soft pink hairline borders
        gem: "#FF6FA8",       // bubblegum pink accent
        gold: "#F5B84B",      // warm gold accent (diamonds/coins)
        magenta: "#E0459A",   // secondary accent for FF
        violet: "#B48CFB",    // lavender accent for Honor of Kings
        ash: "#9B7B94",       // muted mauve text
      },
      fontFamily: {
        display: ["Rajdhani", "Khmer OS Battambang", "sans-serif"],
        body: ["Inter", "Noto Sans Khmer", "sans-serif"],
      },
      backgroundImage: {
        facet: "linear-gradient(135deg, rgba(255,111,168,0.14) 0%, rgba(255,240,245,0) 45%), linear-gradient(315deg, rgba(245,184,75,0.10) 0%, rgba(255,240,245,0) 50%)",
      },
    },
  },
  plugins: [],
};
