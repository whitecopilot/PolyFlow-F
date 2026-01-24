import { Box, Flex, Text } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineHome,
  HiHome,
  HiOutlineCube,
  HiCube,
  HiOutlineWallet,
  HiWallet,
  HiOutlineChartBar,
  HiChartBar,
  HiOutlineUserGroup,
  HiUserGroup,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  activeIcon: React.ElementType
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: HiOutlineHome, activeIcon: HiHome },
  { path: '/nft', label: 'NFT', icon: HiOutlineCube, activeIcon: HiCube },
  { path: '/assets', label: '资产', icon: HiOutlineWallet, activeIcon: HiWallet },
  { path: '/rewards', label: '收益', icon: HiOutlineChartBar, activeIcon: HiChartBar },
  { path: '/team', label: '团队', icon: HiOutlineUserGroup, activeIcon: HiUserGroup },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Box
      position="fixed"
      bottom="0"
      left="50%"
      transform="translateX(-50%)"
      w="100%"
      maxW="430px"
      bg="rgba(17, 17, 19, 0.95)"
      backdropFilter="blur(20px)"
      pb="env(safe-area-inset-bottom)"
      zIndex="50"
    >
      <Flex justify="space-around" align="center" h="68px" px="4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = isActive ? item.activeIcon : item.icon

          return (
            <MotionBox
              key={item.path}
              onClick={() => navigate(item.path)}
              cursor="pointer"
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap="1"
              p="2"
              borderRadius="12px"
              minW="50px"
              position="relative"
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Box
                color={isActive ? 'brand.primary' : 'text.muted'}
                transition="color 0.2s"
              >
                <Icon size={24} />
              </Box>
              <Text
                fontSize="xs"
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? 'brand.primary' : 'text.muted'}
                transition="all 0.2s"
              >
                {item.label}
              </Text>
              {isActive && (
                <MotionBox
                  position="absolute"
                  bottom="0"
                  h="3px"
                  w="20px"
                  bg="brand.primary"
                  borderRadius="full"
                  layoutId="activeTab"
                />
              )}
            </MotionBox>
          )
        })}
      </Flex>
    </Box>
  )
}
