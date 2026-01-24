// 二级页面布局 - 无底部导航栏

import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

export function SecondaryLayout() {
  return (
    <Flex
      direction="column"
      minH="100vh"
      maxW="430px"
      mx="auto"
      bg="bg.canvas"
      position="relative"
    >
      <Box flex="1" pt="56px" overflowY="auto">
        <Outlet />
      </Box>
    </Flex>
  )
}
