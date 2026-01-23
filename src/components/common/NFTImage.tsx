import { useState } from 'react'
import { Text, Center } from '@chakra-ui/react'

interface NFTImageProps {
  src: string
  alt: string
  w?: string
  h?: string
  fallbackText?: string
}

export function NFTImage({ src, alt, w = '60px', h = '60px', fallbackText = 'NFT' }: NFTImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <Center w={w} h={h}>
        <Text fontSize="xl" fontWeight="bold" color="white">
          {fallbackText}
        </Text>
      </Center>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: w,
        height: h,
        objectFit: 'cover',
      }}
      onError={() => setHasError(true)}
    />
  )
}
