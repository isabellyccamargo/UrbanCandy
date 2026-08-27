import { createContext, useContext } from 'react';

const COLORS = {
    background: '#F7F7F7',
    white: '#FFFFFF',

    primary: '#DD2E8A',
    secondary: '#E7C9DA',

    text: '#222222',
    textSecondary: '#666666',
    textTertiary: '#777777',

    border: '#EEEEEE',

    success: '#00A855',
    danger: '#FF3A2D',

    transparent: 'transparent',
};

const FONT = {
    regular: 'Quicksand_400Regular',
    medium: 'Quicksand_500Medium',
    semibold: 'Quicksand_600SemiBold',
    bold: 'Quicksand_700Bold',
};

const FONT_SIZE = {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 21,
    xxl: 24,
    title: 29,
    display: 43,
};

const SPACE = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    huge: 40,
};

const RADIUS = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    xxl: 28,
    pill: 999,
    circle: 9999,
};

const SIZES = {
    buttonHeight: 48,
    inputHeight: 48,
    bottomMenuHeight: 80,
    iconContainer: 28,
};

type ThemeContextType = {
    colors: typeof COLORS;
    font: typeof FONT;
    fontSize: typeof FONT_SIZE;
    space: typeof SPACE;
    radius: typeof RADIUS;
    sizes: typeof SIZES;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

type Props = {
    children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
    return (
        <ThemeContext.Provider
            value={{
                colors: COLORS,
                font: FONT,
                fontSize: FONT_SIZE,
                space: SPACE,
                radius: RADIUS,
                sizes: SIZES,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            'useTheme deve ser usado dentro do ThemeProvider'
        );
    }

    return context;
}