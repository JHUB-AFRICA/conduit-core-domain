/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f4f2ec",
        "bg-soft": "#ece9e0",
        ink: "#15170f",
        "ink-soft": "#4a4c40",
        muted: "#83836f",
        line: "#dcd8ca",
        card: "#12140d",
        "card-line": "#2a2d20",
        accent: "#c15a2c",
        "accent-soft": "#f0d9c9",
        green: "#3a6b4a",
        "green-bg": "#e2ecdf",
        white: "#fdfcf8",
      },
      fontFamily: {
        display: ['"Source Serif 4"', "Georgia", "serif"],
        body: ["Inter", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', "monospace"],
      },
      maxWidth: {
        wrap: "1120px",
      },
    },
  },
  plugins: [],
};
