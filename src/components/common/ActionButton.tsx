import { Button } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

export interface ActionButtonProps {
  variant?: ButtonVariant
  children?: ReactNode
  onClick?: () => void | Promise<void>
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  flex?: string | number
  w?: string
  h?: string
  px?: string | number
  py?: string | number
  mt?: string | number
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '2xs' | 'xs'
  bg?: string
}

export function ActionButton({
  variant = 'primary',
  children,
  onClick,
  loading,
  loadingText,
  disabled,
  flex,
  w,
  h = '48px',
  px = '6',
  py,
  mt,
  size,
  bg: customBg,
}: ActionButtonProps) {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: customBg || '#1A1A1E',
          color: 'white',
          border: '1px solid',
          borderColor: '#3A3A40',
          _hover: { bg: '#2A2A30', borderColor: '#5A5A60' },
          _active: { bg: '#3A3A40', borderColor: '#6A6A70' },
        }
      case 'secondary':
        return {
          bg: '#1A1A1D',
          color: 'white',
          border: '1px solid',
          borderColor: '#2D2D31',
          _hover: { bg: '#232326', borderColor: '#4D4D51' },
          _active: { bg: '#232326' },
        }
      case 'outline':
        return {
          bg: 'transparent',
          color: '#A1A1AA',
          border: '1px solid',
          borderColor: '#3D3D41',
          _hover: { bg: 'rgba(61, 61, 65, 0.3)' },
          _active: { bg: 'rgba(61, 61, 65, 0.5)' },
        }
      case 'ghost':
        return {
          bg: 'transparent',
          color: '#A1A1AA',
          _hover: { bg: '#1A1A1D', color: 'white' },
          _active: { bg: '#232326' },
        }
      default:
        return {}
    }
  }

  return (
    <Button
      h={h}
      px={px}
      py={py}
      fontSize="sm"
      fontWeight="600"
      borderRadius="12px"
      cursor="pointer"
      flex={flex}
      w={w}
      mt={mt}
      size={size}
      onClick={onClick}
      loading={loading}
      loadingText={loadingText}
      disabled={disabled || loading}
      {...getStyles()}
    >
      {children}
    </Button>
  )
}
