import { Button } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

interface ActionButtonProps {
  variant?: ButtonVariant
  children?: ReactNode
  onClick?: () => void
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  flex?: string | number
  w?: string
  h?: string
  px?: string | number
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
  mt,
  size,
  bg: customBg,
}: ActionButtonProps) {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: customBg || '#4F46E5',
          color: 'white',
          _hover: { bg: '#4338CA' },
          _active: { bg: '#3730A3' },
        }
      case 'secondary':
        return {
          bg: '#1A1A1D',
          color: 'white',
          border: '1px solid',
          borderColor: '#2D2D31',
          _hover: { bg: '#232326', borderColor: '#4F46E5' },
          _active: { bg: '#232326' },
        }
      case 'outline':
        return {
          bg: 'transparent',
          color: '#4F46E5',
          border: '1px solid',
          borderColor: '#4F46E5',
          _hover: { bg: 'rgba(79, 70, 229, 0.1)' },
          _active: { bg: 'rgba(79, 70, 229, 0.2)' },
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
