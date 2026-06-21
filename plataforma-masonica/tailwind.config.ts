import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1F3864",
        royal: "#2E75B6",
        gold: "#C8A14B",
        ink: "#1a1d29",
      },
      fontFamily: { sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial"] },
    },
  },
  plugins: [],
};
export default config;
