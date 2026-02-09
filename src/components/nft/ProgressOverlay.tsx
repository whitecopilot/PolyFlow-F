import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { CheckCircle } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { HiOutlineXMark } from 'react-icons/hi2'
import { ActionButton } from '../common'

const MotionBox = motion.create(Box)

interface ProgressOverlayProps {
  progress: number
  totalSteps: number
  isSuccess: boolean
  isError: boolean
  isSigningStep: boolean
  statusText: string
  onClose?: () => void
}

export function ProgressOverlay({
  progress,
  totalSteps,
  isSuccess,
  isError,
  isSigningStep,
  statusText,
  onClose,
}: ProgressOverlayProps) {
  const { t } = useTranslation()

  return (
    <MotionBox
      position="fixed"
      inset={0}
      bg="blackAlpha.800"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <VStack
        gap={6}
        p={8}
        bg="rgba(23, 23, 28, 0.95)"
        borderRadius="2xl"
        borderWidth={1}
        borderColor="whiteAlpha.100"
        maxW={isError ? '90%' : '320px'}
        w="90%"
        maxH="80vh"
      >
        {/* 状态图标 */}
        {isSuccess ? (
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <CheckCircle size={64} weight="fill" color="#FFFFFF" />
          </MotionBox>
        ) : isError ? (
          <Box
            w={16}
            h={16}
            borderRadius="full"
            bg="rgba(156, 163, 175, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <HiOutlineXMark size={32} color="#9CA3AF" />
          </Box>
        ) : (
          <Spinner
            color="whiteAlpha.700"
            w={16}
            h={16}
            borderWidth="4px"
          />
        )}

        {/* 状态文本 */}
        <Box w="full" overflow={isError ? 'auto' : 'visible'} maxH={isError ? '50vh' : 'none'}>
          <Text
            fontSize={isError ? 'sm' : 'lg'}
            fontWeight="bold"
            color={isError ? 'whiteAlpha.600' : 'white'}
            textAlign="center"
            wordBreak="break-word"
            whiteSpace="pre-wrap"
          >
            {statusText}
          </Text>

          {!isSuccess && !isError && (
            <Text fontSize="sm" color="whiteAlpha.600" textAlign="center" mt={2}>
              {t('mint.step')} {progress}/{totalSteps}
            </Text>
          )}
        </Box>

        {/* 进度指示器 */}
        {!isSuccess && !isError && (
          <HStack gap={2}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
              <Box
                key={i}
                w={2}
                h={2}
                borderRadius="full"
                bg={i <= progress ? 'white' : 'whiteAlpha.200'}
                transition="background-color 0.3s"
              />
            ))}
          </HStack>
        )}

        {/* 钱包确认提示 */}
        {isSigningStep && (
          <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
            {t('mint.wallet_confirm_hint')}
          </Text>
        )}

        {/* 关闭按钮 */}
        {(isSuccess || isError) && onClose && (
          <Box w="full" mt={2} flexShrink={0}>
            <ActionButton
              variant={isSuccess ? 'primary' : 'secondary'}
              size="md"
              onClick={onClose}
              w="full"
            >
              {t('common.close')}
            </ActionButton>
          </Box>
        )}
      </VStack>
    </MotionBox>
  )
}
