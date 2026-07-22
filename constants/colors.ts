export const Colors = {
  primary: "#7655C9",
  primaryPressed: "#6242B4",
  primaryDark: "#50369D",
  primaryLight: "#EEE8FF",
  primarySubtle: "#F6F2FF",

  secondary: "#E889B8",
  secondaryLight: "#FCECF4",

  background: "#FAF9FD",
  backgroundMuted: "#F3F0F6",
  surface: "#FFFFFF",
  surfaceRaised: "#FFFFFF",

  text: "#211F26",
  textSecondary: "#514C58",
  textMuted: "#6F6A78",
  textLight: "#A59FAC",
  textInverse: "#FFFFFF",

  border: "#E5E0EA",
  borderStrong: "#CDC6D5",
  divider: "#EFEAF2",

  success: "#2D8B68",
  successLight: "#E7F5EF",

  warning: "#B66B18",
  warningLight: "#FFF3DF",

  danger: "#C14552",
  dangerLight: "#FCEAEC",

  info: "#3F72B5",
  infoLight: "#EAF2FC",

  overlay: "rgba(20, 17, 25, 0.48)",
  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export type ColorToken = keyof typeof Colors;