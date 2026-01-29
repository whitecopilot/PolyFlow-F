import { Box, Button, Flex, Input, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlineTicket, HiOutlineWallet } from 'react-icons/hi2'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useConnect } from 'wagmi'
import { useTranslation } from 'react-i18next'
import { PolyFlowLogo } from '../components/common'
import { useAuth } from '../hooks/useAuth'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { isAuthenticated, isConnected, signIn, isLoading, needsBindInviter } = useAuth()
  const [step, setStep] = useState<'connect' | 'sign' | 'invite'>('connect')
  const [inviteCode, setInviteCode] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  // 是否已经尝试过无邀请码登录
  const [hasTriedWithoutCode, setHasTriedWithoutCode] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  // 从 URL 中提取邀请码
  const urlInviteCode = useMemo(() => {
    return searchParams.get('ref') || searchParams.get('invite') || ''
  }, [searchParams])

  // 最终使用的邀请码（URL 优先，然后是用户输入）
  const finalInviteCode = urlInviteCode || inviteCode

  // 如果已登录，重定向到目标页
  useEffect(() => {
    if (isAuthenticated && !needsBindInviter) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, needsBindInviter, navigate, from])

  // 钱包已连接但未签名，直接进入签名步骤
  useEffect(() => {
    if (isConnected && !isAuthenticated && step === 'connect') {
      setStep('sign')
    }
  }, [isConnected, isAuthenticated, step])

  // 使用第一个可用的 connector 连接钱包
  const handleConnect = async () => {
    const connector = connectors[0]
    if (!connector) return

    setLoginError(null)
    try {
      await connect({ connector })
    } catch (error) {
      console.error('连接失败:', error)
      setLoginError(t('login.connect_failed'))
    }
  }

  // 签名登录
  const handleSign = async () => {
    setLoginError(null)

    // 如果有 URL 邀请码或用户输入了邀请码，直接使用
    const codeToUse = finalInviteCode || undefined

    const result = await signIn(codeToUse)

    if (result.success) {
      navigate(from, { replace: true })
    } else if (result.needsInviteCode && !hasTriedWithoutCode) {
      // 新用户需要邀请码，显示邀请码输入界面
      setHasTriedWithoutCode(true)
      setStep('invite')
      setLoginError(null)
    } else {
      // 其他错误
      setLoginError(result.errorMessage || t('login.sign_failed'))
    }
  }

  // 使用邀请码重新登录
  const handleSignWithInviteCode = async () => {
    if (!inviteCode.trim()) {
      setLoginError(t('login.invite_code_required'))
      return
    }

    setLoginError(null)
    const result = await signIn(inviteCode)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setLoginError(result.errorMessage || t('login.sign_failed'))
    }
  }

  return (
    <Flex
      direction="column"
      minH="100vh"
      maxW="430px"
      mx="auto"
      bg="bg.canvas"
      position="relative"
      overflow="hidden"
    >
      {/* 背景装饰 */}
      <Box
        position="absolute"
        top="-20%"
        right="-30%"
        w="400px"
        h="400px"
        bg="radial-gradient(circle, rgba(41, 47, 225, 0.15) 0%, transparent 70%)"
        borderRadius="full"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        left="-20%"
        w="300px"
        h="300px"
        bg="radial-gradient(circle, rgba(216, 17, 240, 0.1) 0%, transparent 70%)"
        borderRadius="full"
        pointerEvents="none"
      />

      {/* 主内容区域 - 居中靠上 */}
      <Flex flex="1" direction="column" justify="flex-start" align="center" p="6" pt="10vh">
        <VStack gap="8" w="100%">
          {/* Logo 和标题 */}
          <MotionFlex
            direction="column"
            align="center"
            gap="6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MotionBox
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <PolyFlowLogo size={100} showText={false} colorMode="gradient" />
            </MotionBox>

            <VStack gap="3">
              <Text
                fontSize="3xl"
                fontWeight="700"
                color="text.primary"
                fontFamily="heading"
                letterSpacing="tight"
              >
                {t('app.name')}
              </Text>
              <Text
                fontSize="md"
                color="text.muted"
                textAlign="center"
                maxW="280px"
                lineHeight="1.6"
              >
                {step === 'connect'
                  ? t('login.subtitle')
                  : step === 'invite'
                  ? t('login.enter_invite_code')
                  : t('login.sign_message')}
              </Text>
            </VStack>
          </MotionFlex>

          {/* 错误提示 */}
          {loginError && (
            <MotionBox
              w="100%"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Box
                bg="rgba(239, 68, 68, 0.1)"
                border="1px solid"
                borderColor="rgba(239, 68, 68, 0.3)"
                borderRadius="12px"
                p="3"
              >
                <Text fontSize="sm" color="red.400" textAlign="center">
                  {loginError}
                </Text>
              </Box>
            </MotionBox>
          )}

          {step === 'connect' ? (
            /* 连接钱包按钮 */
            <MotionBox
              w="100%"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                w="100%"
                h="56px"
                bg="linear-gradient(135deg, #292FE1 0%, #D811F0 100%)"
                color="white"
                fontSize="md"
                fontWeight="600"
                borderRadius="14px"
                _hover={{ opacity: 0.9, transform: 'scale(1.02)' }}
                _active={{ transform: 'scale(0.98)' }}
                onClick={handleConnect}
                loading={isConnecting}
                loadingText={t('login.connecting')}
              >
                <Flex align="center" gap="3">
                  <HiOutlineWallet size={22} />
                  <Text>{t('login.connect_wallet')}</Text>
                </Flex>
              </Button>

              {/* 显示 URL 中的邀请码 */}
              {urlInviteCode && (
                <Box
                  mt="4"
                  bg="rgba(41, 47, 225, 0.1)"
                  borderRadius="12px"
                  p="3"
                  border="1px solid"
                  borderColor="rgba(41, 47, 225, 0.2)"
                >
                  <Flex align="center" justify="center" gap="2">
                    <HiOutlineTicket size={16} color="#292FE1" />
                    <Text fontSize="sm" color="text.secondary">
                      {t('login.invite_code')}: <Text as="span" color="brand.primary" fontWeight="600">{urlInviteCode}</Text>
                    </Text>
                  </Flex>
                </Box>
              )}

              <Text
                fontSize="xs"
                color="text.muted"
                textAlign="center"
                mt="4"
              >
                {t('login.terms_notice')}
              </Text>
            </MotionBox>
          ) : step === 'sign' ? (
            /* 签名步骤 */
            <MotionBox
              w="100%"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Box
                bg="bg.card"
                borderRadius="16px"
                p="5"
                border="1px solid"
                borderColor="border.default"
                mb="4"
              >
                <Flex align="center" gap="3" mb="4">
                  <Flex
                    w="44px"
                    h="44px"
                    borderRadius="12px"
                    bg="rgba(41, 47, 225, 0.15)"
                    align="center"
                    justify="center"
                  >
                    <HiOutlineWallet size={22} color="#292FE1" />
                  </Flex>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="text.primary">
                      {t('login.wallet_connected')}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {t('login.sign_to_verify')}
                    </Text>
                  </Box>
                </Flex>

                {/* 显示邀请码（如果有） */}
                {finalInviteCode && (
                  <Box
                    bg="rgba(41, 47, 225, 0.1)"
                    borderRadius="10px"
                    p="3"
                    mb="4"
                  >
                    <Flex align="center" justify="center" gap="2">
                      <HiOutlineTicket size={16} color="#292FE1" />
                      <Text fontSize="sm" color="text.secondary">
                        {t('login.invite_code')}: <Text as="span" color="brand.primary" fontWeight="600">{finalInviteCode}</Text>
                      </Text>
                    </Flex>
                  </Box>
                )}

                <Text fontSize="xs" color="text.muted" lineHeight="1.6">
                  {t('login.sign_notice')}
                </Text>
              </Box>

              <Button
                w="100%"
                h="56px"
                bg="brand.primary"
                color="white"
                fontSize="md"
                fontWeight="600"
                borderRadius="14px"
                _hover={{ bg: 'brand.hover' }}
                _active={{ transform: 'scale(0.98)' }}
                onClick={handleSign}
                loading={isLoading}
                loadingText={t('login.waiting_sign')}
              >
                <Flex align="center" gap="3">
                  <HiOutlineWallet size={22} />
                  <Text>{t('login.sign_to_login')}</Text>
                </Flex>
              </Button>

              <Button
                w="100%"
                h="44px"
                bg="transparent"
                color="text.muted"
                fontSize="sm"
                fontWeight="500"
                borderRadius="12px"
                mt="3"
                _hover={{ color: 'text.primary' }}
                onClick={() => setStep('connect')}
              >
                {t('login.use_other_wallet')}
              </Button>
            </MotionBox>
          ) : (
            /* 邀请码输入步骤（仅当新用户需要邀请码时显示） */
            <MotionBox
              w="100%"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Box
                bg="bg.card"
                borderRadius="16px"
                p="5"
                border="1px solid"
                borderColor="border.default"
                mb="4"
              >
                <Flex align="center" gap="3" mb="4">
                  <Flex
                    w="44px"
                    h="44px"
                    borderRadius="12px"
                    bg="rgba(217, 70, 239, 0.15)"
                    align="center"
                    justify="center"
                  >
                    <HiOutlineTicket size={22} color="#D946EF" />
                  </Flex>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="text.primary">
                      {t('login.invite_code_title')}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {t('login.invite_code_subtitle')}
                    </Text>
                  </Box>
                </Flex>

                <Input
                  placeholder={t('login.invite_code_placeholder')}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  bg="bg.input"
                  border="1px solid"
                  borderColor="border.default"
                  borderRadius="12px"
                  h="48px"
                  fontSize="md"
                  fontWeight="600"
                  letterSpacing="wider"
                  textAlign="center"
                  color="text.primary"
                  _placeholder={{ color: 'text.disabled' }}
                  _focus={{
                    borderColor: 'brand.primary',
                    boxShadow: '0 0 0 1px rgba(41, 47, 225, 0.3)',
                  }}
                />

                <Text fontSize="xs" color="text.muted" mt="3" lineHeight="1.6">
                  {t('login.invite_code_notice')}
                </Text>
              </Box>

              <Button
                w="100%"
                h="56px"
                bg="brand.primary"
                color="white"
                fontSize="md"
                fontWeight="600"
                borderRadius="14px"
                _hover={{ bg: 'brand.hover' }}
                _active={{ transform: 'scale(0.98)' }}
                onClick={handleSignWithInviteCode}
                loading={isLoading}
                loadingText={t('login.waiting_sign')}
                disabled={!inviteCode.trim()}
              >
                <Text>{t('login.continue')}</Text>
              </Button>

              <Button
                w="100%"
                h="44px"
                bg="transparent"
                color="text.muted"
                fontSize="sm"
                fontWeight="500"
                borderRadius="12px"
                mt="3"
                _hover={{ color: 'text.primary' }}
                onClick={() => {
                  setStep('connect')
                  setHasTriedWithoutCode(false)
                }}
              >
                {t('login.use_other_wallet')}
              </Button>
            </MotionBox>
          )}
        </VStack>
      </Flex>

      {/* 底部装饰 */}
      <Flex justify="center" pb="8">
        <Text fontSize="xs" color="text.disabled">
          Powered by BSC Network
        </Text>
      </Flex>
    </Flex>
  )
}
