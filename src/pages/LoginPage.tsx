import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { HiOutlineWallet } from 'react-icons/hi2'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConnect } from 'wagmi'
import { PolyFlowLogo } from '../components/common'
import { useAuth } from '../hooks/useAuth'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { isAuthenticated, isConnected, signIn, isLoading } = useAuth()
  const [step, setStep] = useState<'connect' | 'sign'>('connect')

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  // 如果已登录，重定向到目标页
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  // 钱包已连接但未签名，进入签名步骤
  useEffect(() => {
    if (isConnected && !isAuthenticated) {
      setStep('sign')
    }
  }, [isConnected, isAuthenticated])

  // 使用第一个可用的 connector 连接钱包
  const handleConnect = async () => {
    const connector = connectors[0]
    if (!connector) return

    try {
      await connect({ connector })
    } catch (error) {
      console.error('连接失败:', error)
    }
  }

  const handleSign = async () => {
    const success = await signIn()
    if (success) {
      navigate(from, { replace: true })
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
      <Flex flex="1" direction="column" justify="flex-start" align="center" p="6" pt="12vh">
        <VStack gap="10" w="100%">
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
                PolyFlow
              </Text>
              <Text
                fontSize="md"
                color="text.muted"
                textAlign="center"
                maxW="280px"
                lineHeight="1.6"
              >
                {step === 'connect'
                  ? 'NFT 质押平台，开启你的 Web3 收益之旅'
                  : '请签名验证您的钱包所有权'}
              </Text>
            </VStack>
          </MotionFlex>

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
                loadingText="连接中..."
              >
                <Flex align="center" gap="3">
                  <HiOutlineWallet size={22} />
                  <Text>钱包登录</Text>
                </Flex>
              </Button>

              <Text
                fontSize="xs"
                color="text.muted"
                textAlign="center"
                mt="4"
              >
                连接钱包即表示您同意我们的服务条款
              </Text>
            </MotionBox>
          ) : (
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
                      钱包已连接
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      请签名以验证所有权
                    </Text>
                  </Box>
                </Flex>

                <Text fontSize="xs" color="text.muted" lineHeight="1.6">
                  签名消息不会产生任何 Gas 费用，仅用于验证您对钱包的所有权。
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
                loadingText="等待签名..."
              >
                <Flex align="center" gap="3">
                  <HiOutlineWallet size={22} />
                  <Text>签名登录</Text>
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
                使用其他钱包
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
