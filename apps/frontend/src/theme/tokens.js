import { Platform } from 'react-native';

const systemFont = Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
});

export const spacing = {
    none: 0,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
    giant: 48,
    section: 56,
};

export const radii = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 999,
    circle: 999,
};

export const fontFamilies = {
    regular: systemFont,
    medium: systemFont,
    semiBold: systemFont,
    bold: systemFont,
    monospace: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace',
    }),
};

export const fontSizes = {
    micro: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
};

export const lineHeights = {
    micro: 14,
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    xxl: 32,
    xxxl: 38,
    display: 44,
};

export const fontWeights = {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
};

export const letterSpacing = {
    tight: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
    uppercase: 0.9,
};

export const typography = {
    display: { fontFamily: fontFamilies.bold, fontSize: fontSizes.display, lineHeight: lineHeights.display, fontWeight: fontWeights.bold, letterSpacing: letterSpacing.tight },
    h1: { fontFamily: fontFamilies.bold, fontSize: fontSizes.xxxl, lineHeight: lineHeights.xxxl, fontWeight: fontWeights.bold, letterSpacing: letterSpacing.tight },
    h2: { fontFamily: fontFamilies.bold, fontSize: fontSizes.xxl, lineHeight: lineHeights.xxl, fontWeight: fontWeights.bold },
    h3: { fontFamily: fontFamilies.semiBold, fontSize: fontSizes.xl, lineHeight: lineHeights.xl, fontWeight: fontWeights.semiBold },
    h4: { fontFamily: fontFamilies.semiBold, fontSize: fontSizes.lg, lineHeight: lineHeights.lg, fontWeight: fontWeights.semiBold },
    title: { fontFamily: fontFamilies.semiBold, fontSize: fontSizes.md, lineHeight: lineHeights.md, fontWeight: fontWeights.semiBold },
    subtitle: { fontFamily: fontFamilies.medium, fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.medium },
    body: { fontFamily: fontFamilies.regular, fontSize: fontSizes.md, lineHeight: lineHeights.lg, fontWeight: fontWeights.regular },
    bodySmall: { fontFamily: fontFamilies.regular, fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.regular },
    label: { fontFamily: fontFamilies.medium, fontSize: fontSizes.sm, lineHeight: lineHeights.md, fontWeight: fontWeights.medium },
    button: { fontFamily: fontFamilies.semiBold, fontSize: fontSizes.sm, lineHeight: lineHeights.md, fontWeight: fontWeights.semiBold, letterSpacing: letterSpacing.wide },
    caption: { fontFamily: fontFamilies.regular, fontSize: fontSizes.xs, lineHeight: lineHeights.xs, fontWeight: fontWeights.regular },
    overline: { fontFamily: fontFamilies.semiBold, fontSize: fontSizes.micro, lineHeight: lineHeights.micro, fontWeight: fontWeights.semiBold, letterSpacing: letterSpacing.uppercase, textTransform: 'uppercase' },
    numeric: { fontFamily: fontFamilies.monospace, fontSize: fontSizes.md, lineHeight: lineHeights.md, fontWeight: fontWeights.medium, fontVariant: ['tabular-nums'] },
};

export const controlSizes = {
    minTouchTarget: 44,
    inputHeight: 48,
    inputHeightCompact: 40,
    buttonHeight: 48,
    buttonHeightCompact: 40,
    iconXs: 14,
    iconSm: 18,
    iconMd: 22,
    iconLg: 28,
    iconXl: 36,
    avatarSm: 32,
    avatarMd: 44,
    avatarLg: 56,
    avatarXl: 72,
};

export const layout = {
    contentMaxWidth: 640,
    screenGutter: 16,
    screenGutterWide: 24,
    headerHeight: 56,
    tabBarHeight: 56,
    dividerWidth: 1,
};

export const zIndex = {
    base: 0,
    raised: 1,
    sticky: 10,
    dropdown: 20,
    overlay: 50,
    modal: 100,
    toast: 200,
};

export const elevation = {
    none: 0,
    xs: 1,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
};

export const durations = {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
};
