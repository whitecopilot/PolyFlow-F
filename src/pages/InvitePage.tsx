import { useState } from 'react'
import { Box, Flex, Text, VStack, Input } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { SecondaryPageHeader } from '../components/layout'
import { ActionButton } from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import { PAYFI_CONFIG } from '../mocks/payfiConfig'
import {
  HiOutlineLink,
  HiOutlineClipboardDocument,
  HiOutlineShare,
  HiOutlineQrCode,
  HiOutlineCheckCircle,
  HiOutlineGift,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

export function InvitePage() {
  const { inviteCode, inviteLink } = usePayFiStore()
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

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
          title: 'PolyFlow NFT 质押',
          text: '加入 PolyFlow，开启你的 Web3 收益之旅！',
          url: inviteLink,
        })
      } catch {
        // 用户取消分享
      }
    } else {
      handleCopy('link')
    }
  }

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
          <Flex justify="space-between" align="flex-start" mb="4">
            <Box>
              <Text fontSize="sm" color="text.muted" mb="1">
                邀请奖励
              </Text>
              <Text fontSize="lg" fontWeight="600" color="text.primary">
                邀请好友，共享收益
              </Text>
            </Box>
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

          <VStack gap="2" align="stretch">
            <RewardItem
              icon={<HiOutlineGift size={16} />}
              text={`直推用户静态收益，获得 ${PAYFI_CONFIG.REFERRAL_L1_RATE * 100}% 推荐奖励`}
            />
            <RewardItem
              icon={<HiOutlineGift size={16} />}
              text={`二代用户静态收益，获得 ${PAYFI_CONFIG.REFERRAL_L2_RATE * 100}% 推荐奖励`}
            />
          </VStack>
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
          <ActionButton flex="1" variant="secondary">
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
            <RuleItem text="3. 好友完成质押后，您即可获得收益加成" />
            <RuleItem text="4. 收益加成永久有效，实时结算" />
          </VStack>
        </Box>

        {/* 常见问题 */}
        <Box
          bg="bg.card"
          borderRadius="14px"
          p="4"
          border="1px solid"
          borderColor="border.default"
        >
          <Text fontSize="sm" fontWeight="600" color="text.secondary" mb="3">
            常见问题
          </Text>
          <VStack gap="4" align="stretch">
            <FAQItem
              question="推荐奖励如何计算？"
              answer="直推用户每日静态收益的 10% 作为您的推荐奖励，二代用户为 5%，实时计算并累计。"
            />
            <FAQItem
              question="邀请人数有上限吗？"
              answer="没有上限，您可以邀请任意数量的好友加入，团队业绩越高，节点等级越高。"
            />
            <FAQItem
              question="推荐奖励以什么形式发放？"
              answer="推荐奖励以 PIC 形式累计，可在收益页面进行提现，提现时 80% 即时到账，20% 线性释放。"
            />
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

interface RewardItemProps {
  icon: React.ReactNode
  text: string
}

function RewardItem({ icon, text }: RewardItemProps) {
  return (
    <Flex align="center" gap="2">
      <Box color="accent.pink">{icon}</Box>
      <Text fontSize="xs" color="text.secondary">
        {text}
      </Text>
    </Flex>
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

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="600" color="text.primary" mb="1">
        {question}
      </Text>
      <Text fontSize="xs" color="text.muted" lineHeight="1.6">
        {answer}
      </Text>
    </Box>
  )
}
