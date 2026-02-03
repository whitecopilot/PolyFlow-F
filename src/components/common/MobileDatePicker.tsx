// 移动端滚轮式日期选择器 - 基于 react-mobile-picker
import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { HiXMark } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import Picker from 'react-mobile-picker'

const MotionBox = motion.create(Box)

interface MobileDatePickerProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: string) => void
  value?: string // YYYY-MM-DD format
  title?: string
  minYear?: number
  maxYear?: number
}

// 生成年份列表
function generateYears(min: number, max: number): string[] {
  const years: string[] = []
  for (let y = max; y >= min; y--) {
    years.push(String(y))
  }
  return years
}

// 生成月份列表
function generateMonths(): string[] {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
}

// 根据年月生成日期列表
function generateDays(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))
}

export function MobileDatePicker({
  isOpen,
  onClose,
  onConfirm,
  value,
  title,
  minYear = 2020,
  maxYear = new Date().getFullYear(),
}: MobileDatePickerProps) {
  const { t } = useTranslation()

  // 解析初始值
  const parseDate = (dateStr?: string) => {
    if (dateStr) {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        return {
          year: parts[0],
          month: parts[1].padStart(2, '0'),
          day: parts[2].padStart(2, '0'),
        }
      }
    }
    const now = new Date()
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: String(now.getDate()).padStart(2, '0'),
    }
  }

  const [pickerValue, setPickerValue] = useState(parseDate(value))

  // 打开时重置为传入值
  useEffect(() => {
    if (isOpen) {
      setPickerValue(parseDate(value))
    }
  }, [isOpen, value])

  // 生成选项列表
  const years = useMemo(() => generateYears(minYear, maxYear), [minYear, maxYear])
  const months = useMemo(() => generateMonths(), [])
  const days = useMemo(
    () => generateDays(Number(pickerValue.year), Number(pickerValue.month)),
    [pickerValue.year, pickerValue.month]
  )

  // 处理值变化
  const handleChange = (newValue: typeof pickerValue, key: string) => {
    // 当年月变化时，确保日期有效
    if (key === 'year' || key === 'month') {
      const newDays = generateDays(Number(newValue.year), Number(newValue.month))
      if (!newDays.includes(newValue.day)) {
        newValue.day = newDays[newDays.length - 1]
      }
    }
    setPickerValue(newValue)
  }

  // 确认选择
  const handleConfirm = () => {
    const dateStr = `${pickerValue.year}-${pickerValue.month}-${pickerValue.day}`
    onConfirm(dateStr)
    onClose()
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <MotionBox
            position="fixed"
            inset={0}
            bg="blackAlpha.700"
            zIndex={200}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 选择器面板 */}
          <MotionBox
            position="fixed"
            left={0}
            right={0}
            bottom={0}
            bg="#17171C"
            borderTopRadius="2xl"
            zIndex={201}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <VStack p="5" gap={4} align="stretch">
              {/* 顶部拖动条 */}
              <Flex justify="center">
                <Box w="40px" h="4px" bg="whiteAlpha.300" borderRadius="full" />
              </Flex>

              {/* 标题栏 */}
              <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="600" color="white">
                  {title || t('team_performance.select_date')}
                </Text>
                <Box
                  p="2"
                  cursor="pointer"
                  color="whiteAlpha.600"
                  _hover={{ color: 'white' }}
                  onClick={onClose}
                >
                  <HiXMark size={20} />
                </Box>
              </Flex>

              {/* 滚轮选择器 */}
              <Box
                css={{
                  '& .picker-container': {
                    backgroundColor: 'transparent',
                  },
                  '& .picker-inner': {
                    maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                  },
                  '& .picker-column': {
                    flex: 1,
                  },
                  '& .picker-item': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '18px',
                    fontWeight: '500',
                  },
                  '& .picker-item-selected': {
                    color: 'white',
                    fontWeight: '600',
                  },
                  '& .picker-highlight': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                  },
                }}
              >
                <Picker
                  value={pickerValue}
                  onChange={handleChange}
                  height={220}
                  itemHeight={44}
                  wheelMode="natural"
                >
                  <Picker.Column name="year">
                    {years.map((year) => (
                      <Picker.Item key={year} value={year}>
                        {({ selected }) => (
                          <Text
                            color={selected ? 'white' : 'whiteAlpha.400'}
                            fontSize={selected ? 'lg' : 'md'}
                            fontWeight={selected ? '600' : '500'}
                            transition="all 0.2s"
                          >
                            {year}{t('team_performance.year_unit')}
                          </Text>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>

                  <Picker.Column name="month">
                    {months.map((month) => (
                      <Picker.Item key={month} value={month}>
                        {({ selected }) => (
                          <Text
                            color={selected ? 'white' : 'whiteAlpha.400'}
                            fontSize={selected ? 'lg' : 'md'}
                            fontWeight={selected ? '600' : '500'}
                            transition="all 0.2s"
                          >
                            {Number(month)}{t('team_performance.month_unit')}
                          </Text>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>

                  <Picker.Column name="day">
                    {days.map((day) => (
                      <Picker.Item key={day} value={day}>
                        {({ selected }) => (
                          <Text
                            color={selected ? 'white' : 'whiteAlpha.400'}
                            fontSize={selected ? 'lg' : 'md'}
                            fontWeight={selected ? '600' : '500'}
                            transition="all 0.2s"
                          >
                            {Number(day)}{t('team_performance.day_unit')}
                          </Text>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              </Box>

              {/* 操作按钮 */}
              <HStack gap={3}>
                <Box
                  flex={1}
                  py={3}
                  textAlign="center"
                  borderRadius="xl"
                  bg="whiteAlpha.100"
                  color="whiteAlpha.700"
                  fontSize="sm"
                  fontWeight="600"
                  cursor="pointer"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={onClose}
                >
                  {t('common.cancel')}
                </Box>
                <Box
                  flex={2}
                  py={3}
                  textAlign="center"
                  borderRadius="xl"
                  bg="white"
                  color="black"
                  fontSize="sm"
                  fontWeight="600"
                  cursor="pointer"
                  _hover={{ bg: 'whiteAlpha.900' }}
                  onClick={handleConfirm}
                >
                  {t('common.confirm')}
                </Box>
              </HStack>

              {/* 安全区域间距 */}
              <Box h="env(safe-area-inset-bottom, 20px)" />
            </VStack>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  )
}
