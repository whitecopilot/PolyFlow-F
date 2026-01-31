// 提现流程遮罩组件

import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2'
import { ActionButton } from './ActionButton'
import type { WithdrawStep } from '../../hooks/useWithdraw'

const MotionBox = motion.create(Box)

interface WithdrawOverlayProps {
  step: WithdrawStep
  statusText: string
  onClose: () => void
  onRetry?: () => void
}

export function WithdrawOverlay({ step, statusText, onClose, onRetry }: WithdrawOverlayProps) {
  const { t } = useTranslation()

  // 只在有活动步骤时显示
  const isVisible = step !== 'idle'

  // 获取步骤图标
  const getStepIcon = () => {
    switch (step) {
      case 'success':
        return <HiOutlineCheckCircle size={48} color="#FFFFFF" />
      case 'error':
        return <HiOutlineExclamationCircle size={48} color="#9CA3AF" />
      default:
        return <Spinner size="xl" color="whiteAlpha.700" borderWidth="4px" />
    }
  }

  // 获取步骤进度
  const getStepProgress = () => {
    const steps: WithdrawStep[] = ['creating', 'getting_tx', 'signing', 'confirming', 'verifying', 'success']
    const currentIndex = steps.indexOf(step)
    return currentIndex >= 0 ? currentIndex + 1 : 0
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionBox
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.7)"
          backdropFilter="blur(4px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={step === 'error' || step === 'success' ? onClose : undefined}
        >
          <MotionBox
            bg="bg.card"
            borderRadius="20px"
            p="8"
            mx="4"
            maxW="320px"
            w="100%"
            textAlign="center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* 图标 */}
            <Flex justify="center" mb="6">
              {getStepIcon()}
            </Flex>

            {/* 状态文字 */}
            <Text
              fontSize="lg"
              fontWeight="600"
              color={step === 'error' ? 'whiteAlpha.600' : 'white'}
              mb="3"
            >
              {statusText}
            </Text>

            {/* 进度指示器 */}
            {step !== 'error' && step !== 'success' && (
              <Box mb="4">
                <Flex justify="center" gap="2" mb="2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                      key={i}
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={i <= getStepProgress() ? 'white' : 'whiteAlpha.300'}
                      transition="background 0.3s"
                    />
                  ))}
                </Flex>
                <Text fontSize="xs" color="text.muted">
                  {t('withdraw.step')} {getStepProgress()} / 5
                </Text>
              </Box>
            )}

            {/* 提示文字 */}
            {step === 'signing' && (
              <Text fontSize="xs" color="text.muted" mt="2">
                {t('withdraw.wallet_confirm_hint')}
              </Text>
            )}

            {/* 按钮 */}
            {step === 'success' && (
              <ActionButton
                variant="primary"
                onClick={onClose}
                mt="4"
                w="100%"
              >
                {t('common.confirm')}
              </ActionButton>
            )}

            {step === 'error' && (
              <Flex direction="column" gap="2" mt="4">
                {onRetry && (
                  <ActionButton
                    variant="primary"
                    onClick={onRetry}
                    w="100%"
                  >
                    {t('common.retry')}
                  </ActionButton>
                )}
                <ActionButton
                  variant="ghost"
                  onClick={onClose}
                  w="100%"
                >
                  {t('withdraw.view_records')}
                </ActionButton>
              </Flex>
            )}
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}
