// 二级页面顶部导航栏 - 固定位置，带返回按钮

import { Box, Flex, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineChevronLeft } from 'react-icons/hi2'

interface SecondaryPageHeaderProps {
  title: string
  rightElement?: React.ReactNode
}

export function SecondaryPageHeader({ title, rightElement }: SecondaryPageHeaderProps) {
  const navigate = useNavigate()

  return (
    <Flex
      justify="space-between"
      align="center"
      px="4"
      py="3"
      bg="rgba(17, 17, 19, 0.95)"
      backdropFilter="blur(10px)"
      position="fixed"
      top="0"
      left="50%"
      transform="translateX(-50%)"
      w="100%"
      maxW="430px"
      zIndex="50"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Flex align="center" gap="2" cursor="pointer" onClick={() => navigate(-1)}>
        <HiOutlineChevronLeft size={24} color="white" />
        <Text fontSize="lg" fontWeight="600" color="white">
          {title}
        </Text>
      </Flex>

      {rightElement && <Box>{rightElement}</Box>}
    </Flex>
  )
}
