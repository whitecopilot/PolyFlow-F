import { Box, Flex, Input, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  HiArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocument,
  HiOutlineGift,
  HiOutlineLink,
  HiOutlineQrCode,
  HiOutlineShare,
  HiXMark,
} from 'react-icons/hi2'
import { ActionButton, PolyFlowLogo } from '../components/common'
import { SecondaryPageHeader } from '../components/layout'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

export function InvitePage() {
  const { inviteCode } = usePayFiStore()
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [showPoster, setShowPoster] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  // 基于当前域名生成邀请链接
  const inviteLink = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://polyflow.tech'
    return `${baseUrl}/?ref=${inviteCode}`
  }, [inviteCode])

  const handleCopy = async (type: 'code' | 'link') => {
    const text = type === 'code' ? inviteCode : inviteLink
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PolyFlow NFT Staking',
          text: 'Join PolyFlow and start your Web3 earning journey!',
          url: inviteLink,
        })
      } catch {
        // 用户取消分享
      }
    } else {
      handleCopy('link')
    }
  }

  // 下载海报
  const handleDownloadPoster = useCallback(async () => {
    if (!posterRef.current) return

    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `PolyFlow_Invite_${inviteCode}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('生成海报失败:', error)
      // 降级：提示用户截图保存
      alert('请长按海报截图保存')
    }
  }, [inviteCode])

  return (
    <Box minH="100vh" bg="black">
      <SecondaryPageHeader title="邀请好友" />

      <VStack gap="5" p="4" align="stretch">
        {/* 邀请奖励卡片 */}
        <MotionBox
          bg="linear-gradient(135deg, rgba(217, 70, 239, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)"
          borderRadius="20px"
          p="5"
          border="1px solid"
          borderColor="rgba(217, 70, 239, 0.3)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex justify="space-between" align="center">
            <Text
              fontSize="xl"
              fontWeight="700"
              color="text.primary"
              letterSpacing="tight"
            >
              Pay with Crypto Earn the Future
            </Text>
            <Flex
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="rgba(217, 70, 239, 0.2)"
              align="center"
              justify="center"
            >
              <HiOutlineGift size={24} color="#D946EF" />
            </Flex>
          </Flex>
        </MotionBox>

        {/* 邀请码 */}
        <MotionBox
          bg="bg.card"
          borderRadius="16px"
          p="4"
          border="1px solid"
          borderColor="border.default"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Flex justify="space-between" align="center" mb="3">
            <Text fontSize="sm" color="text.muted">
              我的邀请码
            </Text>
            <Flex
              align="center"
              gap="1"
              color={copied === 'code' ? 'accent.green' : 'brand.primary'}
              cursor="pointer"
              onClick={() => handleCopy('code')}
            >
              {copied === 'code' ? (
                <>
                  <HiOutlineCheckCircle size={14} />
                  <Text fontSize="xs">已复制</Text>
                </>
              ) : (
                <>
                  <HiOutlineClipboardDocument size={14} />
                  <Text fontSize="xs">复制</Text>
                </>
              )}
            </Flex>
          </Flex>

          <Flex
            bg="bg.input"
            borderRadius="12px"
            p="4"
            align="center"
            justify="center"
          >
            <Text
              fontSize="2xl"
              fontWeight="700"
              color="text.primary"
              fontFamily="heading"
              letterSpacing="widest"
            >
              {inviteCode}
            </Text>
          </Flex>
        </MotionBox>

        {/* 邀请链接 */}
        <MotionBox
          bg="bg.card"
          borderRadius="16px"
          p="4"
          border="1px solid"
          borderColor="border.default"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Flex justify="space-between" align="center" mb="3">
            <Text fontSize="sm" color="text.muted">
              邀请链接
            </Text>
            <Flex
              align="center"
              gap="1"
              color={copied === 'link' ? 'accent.green' : 'brand.primary'}
              cursor="pointer"
              onClick={() => handleCopy('link')}
            >
              {copied === 'link' ? (
                <>
                  <HiOutlineCheckCircle size={14} />
                  <Text fontSize="xs">已复制</Text>
                </>
              ) : (
                <>
                  <HiOutlineClipboardDocument size={14} />
                  <Text fontSize="xs">复制</Text>
                </>
              )}
            </Flex>
          </Flex>

          <Flex
            bg="bg.input"
            borderRadius="12px"
            p="3"
            align="center"
            gap="2"
          >
            <Box color="text.muted">
              <HiOutlineLink size={18} />
            </Box>
            <Input
              value={inviteLink}
              readOnly
              bg="transparent"
              border="none"
              fontSize="sm"
              color="text.secondary"
              _focus={{ outline: 'none', boxShadow: 'none' }}
              p="0"
            />
          </Flex>
        </MotionBox>

        {/* 操作按钮 */}
        <Flex gap="3">
          <ActionButton flex="1" variant="primary" onClick={handleShare}>
            <Flex align="center" gap="2">
              <HiOutlineShare size={18} />
              <Text>分享链接</Text>
            </Flex>
          </ActionButton>
          <ActionButton flex="1" variant="secondary" onClick={() => setShowPoster(true)}>
            <Flex align="center" gap="2">
              <HiOutlineQrCode size={18} />
              <Text>生成海报</Text>
            </Flex>
          </ActionButton>
        </Flex>

        {/* 邀请说明 */}
        <Box
          bg="bg.card"
          borderRadius="14px"
          p="4"
          border="1px solid"
          borderColor="border.default"
        >
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            邀请说明
          </Text>
          <VStack gap="2" align="stretch">
            <RuleItem text="1. 分享您的专属邀请链接给好友" />
            <RuleItem text="2. 好友通过链接注册并连接钱包" />
            <RuleItem text="3. 好友完成质押后，您即可获得奖励" />
            <RuleItem text="4. 奖励永久有效，实时结算" />
          </VStack>
        </Box>
      </VStack>

      {/* 海报弹窗 */}
      <AnimatePresence>
        {showPoster && (
          <>
            {/* 遮罩层 */}
            <MotionBox
              position="fixed"
              inset={0}
              bg="blackAlpha.800"
              zIndex={100}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPoster(false)}
            />

            {/* 海报内容 */}
            <MotionBox
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              zIndex={101}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p="4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 海报画布 */}
              <Box
                ref={posterRef}
                w="320px"
                bg="linear-gradient(180deg, #0a0a0f 0%, #111118 50%, #0d0d12 100%)"
                borderRadius="20px"
                overflow="hidden"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.8)"
              >
                {/* 顶部装饰 */}
                <Box
                  position="absolute"
                  top="-50px"
                  right="-50px"
                  w="150px"
                  h="150px"
                  bg="radial-gradient(circle, rgba(41, 47, 225, 0.3) 0%, transparent 70%)"
                  borderRadius="full"
                  pointerEvents="none"
                />
                <Box
                  position="absolute"
                  bottom="100px"
                  left="-30px"
                  w="100px"
                  h="100px"
                  bg="radial-gradient(circle, rgba(216, 17, 240, 0.2) 0%, transparent 70%)"
                  borderRadius="full"
                  pointerEvents="none"
                />

                <VStack gap="5" p="6" position="relative">
                  {/* Logo 和标题 */}
                  <VStack gap="2">
                    <PolyFlowLogo size={48} showText={false} colorMode="gradient" />
                    <Text fontSize="xl" fontWeight="bold" color="white">
                      PolyFlow
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600" textAlign="center">
                      NFT Staking Platform
                    </Text>
                  </VStack>

                  {/* 广告语 */}
                  <Box
                    bg="linear-gradient(135deg, rgba(41, 47, 225, 0.2) 0%, rgba(216, 17, 240, 0.2) 100%)"
                    borderRadius="12px"
                    p="4"
                    w="full"
                    textAlign="center"
                  >
                    <Text fontSize="lg" fontWeight="bold" color="white" mb="1">
                      开启 PayFi 收益之旅
                    </Text>
                  </Box>

                  {/* 二维码 */}
                  <Box
                    bg="white"
                    p="3"
                    borderRadius="16px"
                    position="relative"
                  >
                    <QRCodeSVG
                      value={inviteLink}
                      size={160}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: '/favicon.svg',
                        x: undefined,
                        y: undefined,
                        height: 32,
                        width: 32,
                        excavate: true,
                      }}
                    />
                  </Box>

                  {/* 邀请码 */}
                  <VStack gap="1">
                    <Text fontSize="xs" color="whiteAlpha.500">
                      邀请码
                    </Text>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color="white"
                      letterSpacing="widest"
                      fontFamily="mono"
                    >
                      {inviteCode}
                    </Text>
                  </VStack>

                  {/* 底部文案 */}
                  <Text fontSize="10px" color="whiteAlpha.400" textAlign="center">
                    扫描二维码，加入 PolyFlow
                  </Text>
                </VStack>
              </Box>

              {/* 操作按钮 */}
              <Flex gap="3" mt="4" justify="center">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPoster(false)}
                >
                  <Flex align="center" gap="2">
                    <HiXMark size={16} />
                    <Text>关闭</Text>
                  </Flex>
                </ActionButton>
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadPoster}
                >
                  <Flex align="center" gap="2">
                    <HiArrowDownTray size={16} />
                    <Text>保存海报</Text>
                  </Flex>
                </ActionButton>
              </Flex>
            </MotionBox>
          </>
        )}
      </AnimatePresence>
    </Box>
  )
}

function RuleItem({ text }: { text: string }) {
  return (
    <Flex align="flex-start" gap="2">
      <Box
        w="4px"
        h="4px"
        borderRadius="full"
        bg="brand.primary"
        mt="2"
        flexShrink={0}
      />
      <Text fontSize="xs" color="text.muted" lineHeight="1.5">
        {text}
      </Text>
    </Flex>
  )
}
