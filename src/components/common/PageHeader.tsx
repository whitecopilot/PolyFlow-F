import { Box, Flex, Text } from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'
import { HiOutlineWallet } from 'react-icons/hi2'
import { PolyFlowLogo } from './PolyFlowLogo'

interface PageHeaderProps {
  title?: string
  showWallet?: boolean
}

export function PageHeader({ title, showWallet = true }: PageHeaderProps) {
  const { shortAddress, isAuthenticated } = useAuth()

  return (
    <Flex
      justify="space-between"
      align="center"
      px="4"
      py="3"
      bg="rgba(17, 17, 19, 0.8)"
      backdropFilter="blur(10px)"
      position="sticky"
      top="0"
      zIndex="40"
    >
      {title ? (
        <Text fontSize="lg" fontWeight="600" color="text.primary">
          {title}
        </Text>
      ) : (
        <PolyFlowLogo size={28} showText colorMode="white" />
      )}

      {showWallet && isAuthenticated && shortAddress && (
        <Flex
          align="center"
          gap="2"
          px="3"
          py="2"
          bg="bg.card"
          borderRadius="10px"
          border="1px solid"
          borderColor="border.default"
        >
          <Box color="brand.primary">
            <HiOutlineWallet size={16} />
          </Box>
          <Text fontSize="xs" color="text.secondary" fontWeight="500">
            {shortAddress}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
