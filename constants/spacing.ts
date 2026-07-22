export const Spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

export const Radius = {
  xs: 8,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 30,
  full: 999,
} as const;

export const IconSize = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
} as const;

export const Layout = {
  screenPadding: Spacing.md,
  contentMaxWidth: 760,
  tabBarHeight: 84,
  minimumTouchTarget: 44,
} as const;