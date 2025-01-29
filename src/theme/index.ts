import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      200: '#7CC4FA',
      300: '#47A3F3',
      400: '#2186EB',
      500: '#0967D2',
      600: '#0552B5',
      700: '#03449E',
      800: '#01337D',
      900: '#002159',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        ghost: {
          color: 'gray.600',
          _hover: {
            bg: 'gray.100',
          },
        },
        outline: {
          borderColor: 'gray.200',
          color: 'gray.600',
          _hover: {
            bg: 'gray.50',
          },
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderBottom: '2px',
            borderColor: 'gray.200',
            fontSize: 'sm',
            fontWeight: 'medium',
            color: 'gray.600',
            textTransform: 'none',
            letterSpacing: 'normal',
          },
          td: {
            borderBottom: '1px',
            borderColor: 'gray.100',
            fontSize: 'sm',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'white',
            borderWidth: '1px',
            borderColor: 'gray.200',
            _hover: {
              bg: 'white',
              borderColor: 'gray.300',
            },
            _focus: {
              bg: 'white',
              borderColor: 'brand.500',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Select: {
      variants: {
        filled: {
          field: {
            bg: 'white',
            borderWidth: '1px',
            borderColor: 'gray.200',
            _hover: {
              bg: 'white',
              borderColor: 'gray.300',
            },
            _focus: {
              bg: 'white',
              borderColor: 'brand.500',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'white',
          borderWidth: '1px',
          borderColor: 'gray.200',
          _hover: {
            bg: 'white',
            borderColor: 'gray.300',
          },
          _focus: {
            bg: 'white',
            borderColor: 'brand.500',
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
});

export default theme; 