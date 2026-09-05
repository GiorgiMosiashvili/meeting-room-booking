// აპლიკაციის დიზაინის ტოკენები (ფერები, დაშორება, რადიუსი და ა.შ.).
// styled-components-ის ThemeProvider-ს გადაეცემა.

export const theme = {
  color: {
    bg: "#f6f7f9",
    surface: "#ffffff",
    surfaceAlt: "#f0f2f5",
    border: "#e2e5ea",
    text: "#1a1d23",
    textMuted: "#5b6472",
    primary: "#2f6feb",
    primaryText: "#ffffff",
    primarySoft: "#e8f0fe",
    danger: "#d92d20",
    dangerSoft: "#fdecea",
    success: "#127a3d",
    successSoft: "#e5f3ec",
    warning: "#8a6a00",
    warningSoft: "#fdf3d7",
    focus: "#93b4f5",
  },
  space: (n: number) => `${n * 4}px`,
  radius: { sm: "6px", md: "10px", lg: "16px", full: "999px" },
  shadow: {
    sm: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.1)",
    md: "0 4px 12px rgba(16,24,40,0.12)",
  },
  font: {
    sans: "var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  maxWidth: "1120px",
  breakpoint: { sm: "640px", md: "768px", lg: "1024px" },
} as const;

export type AppTheme = typeof theme;
