'use client'

import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

const theme = extendTheme({
    config,
    styles: {
        global: (props: { colorMode: string }) => ({
            body: {
                bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
                color: props.colorMode === 'dark' ? 'white' : 'gray.800',
            },
        }),
    },
    colors: {
        brand: {
            50: '#e6f6ff',
            100: '#b3e0ff',
            200: '#80cbff',
            300: '#4db5ff',
            400: '#1a9fff',
            500: '#0088e6',
            600: '#006bb3',
            700: '#004d80',
            800: '#00304d',
            900: '#00131a',
        },
    },
    fonts: {
        heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        mono: `'JetBrains Mono', 'Fira Code', Consolas, monospace`,
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: '600',
                borderRadius: 'lg',
            },
            defaultProps: {
                colorScheme: 'brand',
            },
        },
        Input: {
            defaultProps: {
                focusBorderColor: 'brand.400',
            },
            variants: {
                filled: (props: { colorMode: string }) => ({
                    field: {
                        bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100',
                        _hover: {
                            bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200',
                        },
                        _focus: {
                            bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'white',
                        },
                    },
                }),
            },
        },
        Select: {
            defaultProps: {
                focusBorderColor: 'brand.400',
            },
        },
        Textarea: {
            defaultProps: {
                focusBorderColor: 'brand.400',
            },
        },
        Modal: {
            baseStyle: (props: { colorMode: string }) => ({
                dialog: {
                    bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                    borderRadius: 'xl',
                    boxShadow: '2xl',
                },
            }),
        },
        Badge: {
            baseStyle: {
                borderRadius: 'md',
                fontWeight: '600',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                px: 2,
                py: 0.5,
            },
        },
        Card: {
            baseStyle: (props: { colorMode: string }) => ({
                container: {
                    bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                    borderRadius: 'xl',
                    boxShadow: 'lg',
                },
            }),
        },
        Tabs: {
            variants: {
                enclosed: (props: { colorMode: string }) => ({
                    tab: {
                        borderRadius: 'lg',
                        fontWeight: '500',
                        _selected: {
                            bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
                            color: 'white',
                        },
                    },
                    tablist: {
                        borderBottom: 'none',
                        gap: 1,
                    },
                }),
            },
        },
        Accordion: {
            baseStyle: (props: { colorMode: string }) => ({
                button: {
                    borderRadius: 'lg',
                    _hover: {
                        bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.100',
                    },
                },
            }),
        },
    },
})

export const Providers = ({ children }: { children: React.ReactNode }): JSX.Element => {
    return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}
