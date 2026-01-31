// 一级页面顶部导航栏 - 浮动胶囊样式

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { HiBars3, HiCheck, HiOutlineWallet, HiXMark } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { PolyFlowLogo } from './PolyFlowLogo'
import { LANGUAGES } from '../../i18n/config'

const MotionBox = motion.create(Box)

interface PageHeaderProps {
  title?: string
}

export function PageHeader({ title }: PageHeaderProps) {
  const { t, i18n } = useTranslation()
  const { shortAddress, isAuthenticated, disconnect } = useAuth()
  const [showDrawer, setShowDrawer] = useState(false)

  const handleLanguageChange = async (langCode: string) => {
    console.log('Changing language to:', langCode)
    try {
      await i18n.changeLanguage(langCode)
      console.log('Language changed to:', i18n.language)
      setShowDrawer(false)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const handleLogout = () => {
    setShowDrawer(false)
    disconnect()
  }

  return (
    <>
      {/* 固定定位容器 */}
      <Box
        position="fixed"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        w="100%"
        maxW="430px"
        zIndex="50"
        px="4"
        pt="3"
      >
        {/* 胶囊样式导航栏 */}
        <Flex
          justify="space-between"
          align="center"
          px="5"
          py="3"
          bg="rgba(35, 35, 45, 0.618)"
          backdropFilter="blur(12px)"
          borderRadius="16px"
          border="1px solid"
          borderColor="rgba(255, 255, 255, 0.06)"
        >
          {/* 左侧：Logo + 标题 */}
          <HStack gap={2}>
            <PolyFlowLogo size={28} showText={false} colorMode="gradient" />
            <Text fontSize="lg" fontWeight="600" color="white">
              {title || t('app.name')}
            </Text>
          </HStack>

          {/* 右侧：汉堡菜单 */}
          <Box
            p="1"
            cursor="pointer"
            color="whiteAlpha.800"
            _hover={{ color: 'white' }}
            transition="color 0.2s"
            onClick={() => setShowDrawer(true)}
          >
            <HiBars3 size={26} />
          </Box>
        </Flex>
      </Box>

      {/* 设置抽屉 */}
      <AnimatePresence mode="wait">
        {showDrawer && (
          <>
            {/* 遮罩层 */}
            <MotionBox
              position="fixed"
              inset={0}
              bg="blackAlpha.700"
              zIndex={100}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
            />

            {/* 抽屉内容 */}
            <MotionBox
              position="fixed"
              top={0}
              right={0}
              bottom={0}
              w="280px"
              maxW="80vw"
              bg="#111113"
              zIndex={101}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <Flex direction="column" h="full" p="5">
                {/* 关闭按钮 */}
                <Flex justify="flex-end" mb="6">
                  <Box
                    p="2"
                    cursor="pointer"
                    color="text.muted"
                    _hover={{ color: 'text.primary' }}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    onClick={() => setShowDrawer(false)}
                  >
                    <HiXMark size={20} />
                  </Box>
                </Flex>

                {/* 钱包地址 */}
                {isAuthenticated && shortAddress && (
                  <Box mb="6">
                    <Text fontSize="sm" color="whiteAlpha.500" mb="2">
                      {t('header.wallet_address')}
                    </Text>
                    <Flex
                      align="center"
                      gap="3"
                      px="4"
                      py="3"
                      bg="whiteAlpha.50"
                      borderRadius="lg"
                    >
                      <HiOutlineWallet size={18} color="#292FE1" />
                      <Text fontSize="sm" color="white" fontWeight="500">
                        {shortAddress}
                      </Text>
                    </Flex>
                  </Box>
                )}

                {/* 分隔线 */}
                <Box h="1px" bg="whiteAlpha.100" mb="6" />

                {/* 语言选择 */}
                <Box mb="6">
                  <Text fontSize="sm" color="whiteAlpha.500" mb="3">
                    {t('header.language')}
                  </Text>
                  <VStack gap={2} align="stretch">
                    {LANGUAGES.map((lang) => (
                      <Flex
                        key={lang.code}
                        align="center"
                        justify="space-between"
                        px="4"
                        py="3"
                        bg={i18n.language === lang.code ? 'whiteAlpha.100' : 'transparent'}
                        borderRadius="lg"
                        cursor="pointer"
                        transition="background 0.2s"
                        _hover={{ bg: 'whiteAlpha.50' }}
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        <HStack gap={3}>
                          <Text fontSize="xl">{lang.flag}</Text>
                          <Text
                            fontSize="md"
                            color="white"
                            fontWeight={i18n.language === lang.code ? '600' : '400'}
                          >
                            {lang.name}
                          </Text>
                        </HStack>
                        {i18n.language === lang.code && (
                          <HiCheck size={20} color="white" />
                        )}
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                {/* 分隔线 */}
                <Box h="1px" bg="whiteAlpha.100" my="4" />

                {/* 登出按钮 */}
                {isAuthenticated && (
                  <Flex
                    align="center"
                    gap={3}
                    px="4"
                    py="3"
                    cursor="pointer"
                    color="red.400"
                    _hover={{ bg: 'whiteAlpha.50' }}
                    borderRadius="lg"
                    transition="background 0.2s"
                    onClick={handleLogout}
                  >
                    <HiXMark size={18} />
                    <Text fontSize="md" fontWeight="500">
                      {t('header.logout')}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </MotionBox>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
