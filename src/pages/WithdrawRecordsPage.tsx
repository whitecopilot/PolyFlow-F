// 提现记录页面 - 二级页面

import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SecondaryPageHeader } from '../components/layout'
import { ActionButton, WithdrawOverlay } from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import { useWithdraw } from '../hooks/useWithdraw'
import type { WithdrawRecord } from '../types/payfi'
import {
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowPath,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

export function WithdrawRecordsPage() {
  const { t } = useTranslation()
  const { withdrawRecords, fetchWithdrawRecords, fetchUserAssets } = usePayFiStore()
  const { step, claimWithdraw, reset, getStatusText } = useWithdraw()
  const [claimingOrderId, setClaimingOrderId] = useState<number | null>(null)

  useEffect(() => {
    fetchWithdrawRecords()
  }, [fetchWithdrawRecords])

  // 计算统计数据
  const totalWithdrawn = withdrawRecords
    .filter((r) => r.status === 'received')
    .reduce((sum, record) => sum + record.amount, 0)
  const completedCount = withdrawRecords.filter((r) => r.status === 'received').length
  const pendingCount = withdrawRecords.filter((r) => r.status === 'cheque' || r.status === 'submit').length

  // 处理提取按钮点击
  const handleClaim = async (record: WithdrawRecord) => {
    setClaimingOrderId(record.id)
    const success = await claimWithdraw(record.id)
    if (success) {
      // 刷新数据
      await Promise.all([fetchWithdrawRecords(), fetchUserAssets()])
    }
  }

  // 处理遮罩关闭
  const handleOverlayClose = () => {
    reset()
    setClaimingOrderId(null)
    // 如果失败了，刷新列表
    if (step === 'error') {
      fetchWithdrawRecords()
    }
  }

  // 处理重试
  const handleRetry = () => {
    if (claimingOrderId) {
      handleClaim(withdrawRecords.find(r => r.id === claimingOrderId)!)
    }
  }

  // 获取状态文字
  const getStatusLabel = (status: WithdrawRecord['status']) => {
    switch (status) {
      case 'received':
        return t('withdraw_records.completed')
      case 'cheque':
        return t('withdraw_records.claimable')
      case 'submit':
        return t('withdraw_records.processing')
      default:
        return status
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: WithdrawRecord['status']) => {
    switch (status) {
      case 'received':
        return '#22C55E'
      case 'cheque':
        return '#D811F0'
      case 'submit':
        return '#EAB308'
      default:
        return 'whiteAlpha.600'
    }
  }

  // 格式化日期
  const formatDate = (date: Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box minH="100vh" bg="#111111">
      <SecondaryPageHeader title={t('withdraw_records.title')} />

      <VStack gap="4" p="4" align="stretch">
        {/* 提现统计 */}
        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <Flex
                w="12"
                h="12"
                borderRadius="xl"
                bg="rgba(34, 197, 94, 0.15)"
                align="center"
                justify="center"
              >
                <HiOutlineBanknotes size={20} color="#22C55E" />
              </Flex>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">
                  {t('withdraw_records.total_withdrawn')}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="#22C55E">
                  {totalWithdrawn.toFixed(2)}
                </Text>
              </Box>
            </HStack>
            <VStack align="end" gap={0}>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('withdraw_records.completed_count', { count: completedCount })}
              </Text>
              {pendingCount > 0 && (
                <Text fontSize="xs" color="#D811F0">
                  {t('withdraw_records.pending_count', { count: pendingCount })}
                </Text>
              )}
            </VStack>
          </Flex>
        </MotionBox>

        {/* 记录列表 */}
        {withdrawRecords.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="16"
            color="whiteAlpha.400"
          >
            <HiOutlineBanknotes size={48} />
            <Text mt="4" fontSize="sm">
              {t('withdraw_records.no_records')}
            </Text>
          </Flex>
        ) : (
          <VStack gap={3}>
            {withdrawRecords.map((record, index) => (
              <MotionBox
                key={record.id}
                w="full"
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* 顶部：金额和状态/按钮 */}
                <Flex justify="space-between" align="center" mb="3">
                  <HStack gap={2}>
                    {record.status === 'received' ? (
                      <HiOutlineCheckCircle size={18} color="#22C55E" />
                    ) : record.status === 'cheque' ? (
                      <HiOutlineArrowPath size={18} color="#D811F0" />
                    ) : (
                      <HiOutlineClock size={18} color="#EAB308" />
                    )}
                    <Text fontSize="lg" fontWeight="600" color="white">
                      {record.amount.toFixed(2)} {record.tokenType}
                    </Text>
                  </HStack>

                  {/* 可提取状态显示提取按钮 */}
                  {record.status === 'cheque' ? (
                    <ActionButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaim(record)}
                      px="4"
                    >
                      {t('withdraw_records.claim')}
                    </ActionButton>
                  ) : (
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                      color={getStatusColor(record.status)}
                    >
                      {getStatusLabel(record.status)}
                    </Text>
                  )}
                </Flex>

                {/* 详情信息 */}
                <HStack gap={4} pt="2" borderTop="1px solid" borderColor="whiteAlpha.100" flexWrap="wrap">
                  {/* 手续费（仅当有手续费时显示） */}
                  {record.servicedFee > 0 && (
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.400">{t('withdraw_records.fee')}</Text>
                      <Text fontSize="sm" color="#EAB308">
                        -{record.servicedFee.toFixed(2)} {record.tokenType}
                      </Text>
                    </Box>
                  )}

                  {/* 来源 */}
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.400">{t('withdraw_records.source')}</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      {record.source === 'released'
                        ? t('withdraw_records.source_released')
                        : t('withdraw_records.source_balance')}
                    </Text>
                  </Box>

                  {/* 创建时间 */}
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.400">{t('withdraw_records.create_time')}</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      {formatDate(record.createdAt)}
                    </Text>
                  </Box>

                  {/* 提取时间（仅已完成的显示） */}
                  {record.claimedAt && (
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.400">{t('withdraw_records.claim_time')}</Text>
                      <Text fontSize="sm" color="#22C55E">
                        {formatDate(record.claimedAt)}
                      </Text>
                    </Box>
                  )}
                </HStack>
              </MotionBox>
            ))}
          </VStack>
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>

      {/* 提现流程遮罩 */}
      <WithdrawOverlay
        step={step}
        statusText={getStatusText()}
        onClose={handleOverlayClose}
        onRetry={handleRetry}
      />
    </Box>
  )
}
