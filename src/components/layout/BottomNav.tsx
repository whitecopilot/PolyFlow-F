import { Box, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  HiChartBar,
  HiCube,
  HiHome,
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineWallet,
  HiUserGroup,
  HiWallet,
} from 'react-icons/hi2'
import { useLocation, useNavigate } from 'react-router-dom'

const MotionBox = motion.create(Box)

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  activeIcon: React.ElementType
}

export function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems: NavItem[] = [
    { path: '/', label: t('nav.home'), icon: HiOutlineHome, activeIcon: HiHome },
    { path: '/nft', label: t('nav.nft'), icon: HiOutlineCube, activeIcon: HiCube },
    { path: '/assets', label: t('nav.assets'), icon: HiOutlineWallet, activeIcon: HiWallet },
    { path: '/rewards', label: t('nav.rewards'), icon: HiOutlineChartBar, activeIcon: HiChartBar },
    { path: '/team', label: t('nav.team'), icon: HiOutlineUserGroup, activeIcon: HiUserGroup },
  ]

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
                color={isActive ? "white" : "whiteAlpha.400"}
                transition="all 0.2s"
                // 选中态可以加一点淡淡的白光，增加“亮起”的感觉
                // style={{ filter: isActive ? "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))" : "none" }}
              >
                <Icon size={22} />
              </Box>
              <Text
                fontSize="xs"
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? "white" : "whiteAlpha.400"}
                transition="all 0.2s"
              >
                {item.label}
              </Text>
              {isActive && (
                <MotionBox
                  position="absolute"
                  bottom="0"
                  h="1px"
                  w="20px"
                  bg="white"
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
