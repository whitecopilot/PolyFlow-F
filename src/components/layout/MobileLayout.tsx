import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function MobileLayout() {
  return (
    <Flex
      direction="column"
      minH="100vh"
      maxW="430px"
      mx="auto"
      bg="bg.canvas"
      position="relative"
    >
      <Box flex="1" pb="80px" overflowY="auto">
        <Outlet />
      </Box>
      <BottomNav />
    </Flex>
  )
}
