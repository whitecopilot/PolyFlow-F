import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useConnect } from 'wagmi'
import { useAuth } from '../hooks/useAuth'
import { NFTImage } from '../components/common'
import { HiOutlineWallet } from 'react-icons/hi2'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

// 钱包图标配置
const walletIcons: Record<string, { icon: string; color: string }> = {
  'MetaMask': { icon: '🦊', color: '#E2761B' },
  'WalletConnect': { icon: '🔗', color: '#3B99FC' },
  'Coinbase Wallet': { icon: '💰', color: '#0052FF' },
  'Injected': { icon: '💎', color: '#627EEA' },
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { isAuthenticated, isConnected, signIn, isLoading } = useAuth()
  const [step, setStep] = useState<'connect' | 'sign'>('connect')
  const [connectingId, setConnectingId] = useState<string | null>(null)

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

  const handleConnect = async (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId)
    if (!connector) return

    setConnectingId(connectorId)
    try {
      await connect({ connector })
    } catch (error) {
      console.error('连接失败:', error)
    }
    setConnectingId(null)
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
        bg="radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)"
        borderRadius="full"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="10%"
        left="-20%"
        w="300px"
        h="300px"
        bg="radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)"
        borderRadius="full"
        pointerEvents="none"
      />

      <Flex flex="1" direction="column" justify="center" align="center" p="6">
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
              w="120px"
              h="120px"
              borderRadius="24px"
              bg="linear-gradient(135deg, #4F46E5 0%, #8B5CF6 50%, #D946EF 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 0 60px rgba(79, 70, 229, 0.4)"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
            >
              <NFTImage
                src="/nft-logo.png"
                alt="PolyFlow"
                w="80px"
                h="80px"
                fallbackText="PF"
              />
            </MotionBox>

            <VStack gap="2">
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
              >
                {step === 'connect'
                  ? 'NFT 质押平台，开启你的 Web3 收益之旅'
                  : '请签名验证您的钱包所有权'}
              </Text>
            </VStack>
          </MotionFlex>

          {step === 'connect' ? (
            <>
              {/* 功能介绍 */}
              <MotionBox
                w="100%"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VStack gap="4" align="stretch">
                  <FeatureItem
                    icon="cube"
                    title="NFT 质押"
                    desc="持有 NFT 即可参与质押获取收益"
                  />
                  <FeatureItem
                    icon="coin"
                    title="代币质押"
                    desc="灵活质押代币，享受高额 APR"
                  />
                  <FeatureItem
                    icon="users"
                    title="团队收益"
                    desc="邀请好友组建团队，共享额外奖励"
                  />
                </VStack>
              </MotionBox>

              {/* 钱包连接选项 */}
              <MotionBox
                w="100%"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Text fontSize="sm" color="text.muted" mb="3" textAlign="center">
                  选择钱包连接
                </Text>
                <VStack gap="3" align="stretch">
                  {connectors.map((connector) => {
                    const walletInfo = walletIcons[connector.name] || walletIcons['Injected']
                    const isThisConnecting = connectingId === connector.id

                    return (
                      <Button
                        key={connector.id}
                        w="100%"
                        h="56px"
                        bg="bg.card"
                        color="text.primary"
                        fontSize="md"
                        fontWeight="600"
                        borderRadius="14px"
                        border="1px solid"
                        borderColor="border.default"
                        _hover={{ bg: 'bg.cardHover', borderColor: 'brand.primary' }}
                        _active={{ transform: 'scale(0.98)' }}
                        onClick={() => handleConnect(connector.id)}
                        loading={isThisConnecting}
                        loadingText="连接中..."
                        disabled={isConnecting}
                      >
                        <Flex align="center" gap="3" w="100%" justify="center">
                          <Text fontSize="xl">{walletInfo.icon}</Text>
                          <Text>{connector.name}</Text>
                        </Flex>
                      </Button>
                    )
                  })}
                </VStack>

                <Text
                  fontSize="xs"
                  color="text.muted"
                  textAlign="center"
                  mt="4"
                >
                  连接钱包即表示您同意我们的服务条款
                </Text>
              </MotionBox>
            </>
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
                    bg="rgba(79, 70, 229, 0.15)"
                    align="center"
                    justify="center"
                  >
                    <HiOutlineWallet size={22} color="#4F46E5" />
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
          Powered by Polygon Network
        </Text>
      </Flex>
    </Flex>
  )
}

interface FeatureItemProps {
  icon: 'cube' | 'coin' | 'users'
  title: string
  desc: string
}

function FeatureItem({ icon, title, desc }: FeatureItemProps) {
  const iconColors = {
    cube: '#8B5CF6',
    coin: '#F59E0B',
    users: '#10B981',
  }

  const iconBgs = {
    cube: 'rgba(139, 92, 246, 0.15)',
    coin: 'rgba(245, 158, 11, 0.15)',
    users: 'rgba(16, 185, 129, 0.15)',
  }

  return (
    <Flex
      align="center"
      gap="4"
      p="4"
      bg="bg.card"
      borderRadius="14px"
      border="1px solid"
      borderColor="border.default"
    >
      <Flex
        w="44px"
        h="44px"
        borderRadius="12px"
        bg={iconBgs[icon]}
        align="center"
        justify="center"
        flexShrink={0}
      >
        {icon === 'cube' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={iconColors[icon]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke={iconColors[icon]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke={iconColors[icon]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {icon === 'coin' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={iconColors[icon]} strokeWidth="2"/>
            <path d="M12 6V18M9 9C9 7.89543 10.3431 7 12 7C13.6569 7 15 7.89543 15 9C15 10.1046 13.6569 11 12 11C10.3431 11 9 11.8954 9 13C9 14.1046 10.3431 15 12 15C13.6569 15 15 15.8954 15 17" stroke={iconColors[icon]} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        {icon === 'users' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke={iconColors[icon]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke={iconColors[icon]} strokeWidth="2"/>
            <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke={iconColors[icon]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke={iconColors[icon]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </Flex>
      <Box>
        <Text fontSize="sm" fontWeight="600" color="text.primary">
          {title}
        </Text>
        <Text fontSize="xs" color="text.muted" mt="0.5">
          {desc}
        </Text>
      </Box>
    </Flex>
  )
}
