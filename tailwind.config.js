/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F1A",       // near-black navy base
        panel: "#131A2B",     // card surface
        panel2: "#1B2540",    // raised surface
        line: "#2A3555",      // hairline borders
        gem: "#3DE0C8",       // cyan gem accent
        gold: "#F2B84B",      // gold accent (diamonds/coins)
        magenta: "#E0459A",   // secondary accent for FF
        violet: "#8B7CF6",    // accent for Honor of Kings
        ash: "#8B93A7",       // muted text
      },
      fontFamily: {
        display: ["Rajdhani", "Khmer OS Battambang", "sans-serif"],
        body: ["Inter", "Noto Sans Khmer", "sans-serif"],
      },
      backgroundImage: {
        facet: "linear-gradient(135deg, rgba(61,224,200,0.14) 0%, rgba(11,15,26,0) 45%), linear-gradient(315deg, rgba(242,184,75,0.10) 0%, rgba(11,15,26,0) 50%)",
      },
    },
  },
  plugins: [],
};
