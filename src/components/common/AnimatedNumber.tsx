// 动画数字组件 - 数字滚动效果

import { Text, Box, type TextProps } from '@chakra-ui/react'
import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedNumberProps extends Omit<TextProps, 'children'> {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  formatOptions?: Intl.NumberFormatOptions
}

const MotionBox = motion.create(Box)

function AnimatedDigit({
  value,
  decimals,
  formatOptions,
}: {
  value: MotionValue<number>
  decimals: number
  formatOptions?: Intl.NumberFormatOptions
}) {
  const display = useTransform(value, (v) => {
    if (formatOptions) {
      return new Intl.NumberFormat('en-US', formatOptions).format(v)
    }
    return v.toFixed(decimals)
  })

  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      setDisplayValue(v)
    })
    return unsubscribe
  }, [display])

  return <>{displayValue}</>
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  duration = 0.8,
  formatOptions,
  ...props
}: AnimatedNumberProps) {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration,
  })

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <Text
      display="inline-flex"
      alignItems="baseline"
      fontFeatureSettings="'tnum'"
      fontVariantNumeric="tabular-nums"
      {...props}
    >
      {prefix}
      <AnimatedDigit value={spring} decimals={decimals} formatOptions={formatOptions} />
      {suffix}
    </Text>
  )
}

// 简化版本：直接显示格式化数字，带淡入效果
export function FadeNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  formatOptions,
  ...props
}: AnimatedNumberProps) {
  const formatted = formatOptions
    ? new Intl.NumberFormat('en-US', formatOptions).format(value)
    : value.toFixed(decimals)

  return (
    <MotionBox
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      display="inline"
    >
      <Text
        fontFeatureSettings="'tnum'"
        fontVariantNumeric="tabular-nums"
        display="inline"
        {...props}
      >
        {prefix}
        {formatted}
        {suffix}
      </Text>
    </MotionBox>
  )
}

export default AnimatedNumber
