// 进度条组件

import { Box, Text, HStack, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

interface ProgressBarProps {
  value: number;      // 当前值
  max: number;        // 最大值
  label?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  height?: number;
  colorScheme?: 'brand' | 'green' | 'yellow' | 'red' | 'gradient';
  animate?: boolean;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  showValue = false,
  height = 8,
  colorScheme = 'brand',
  animate = true,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const colorStyles = {
    brand: 'linear-gradient(90deg, #292FE1 0%, #D811F0 100%)',
    green: 'linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)',
    yellow: 'linear-gradient(90deg, #EAB308 0%, #FDE047 100%)',
    red: 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)',
    gradient: 'linear-gradient(90deg, #171CA2 0%, #292FE1 33%, #D811F0 66%, #FF6B6B 100%)',
  };

  return (
    <VStack align="stretch" gap={1} w="full">
      {(label || showPercentage || showValue) && (
        <HStack justify="space-between">
          {label && (
            <Text fontSize="sm" color="whiteAlpha.700">
              {label}
            </Text>
          )}
          <HStack gap={2}>
            {showValue && (
              <Text fontSize="sm" color="whiteAlpha.600">
                {value.toLocaleString()} / {max.toLocaleString()}
              </Text>
            )}
            {showPercentage && (
              <Text fontSize="sm" color="white" fontWeight="medium">
                {percentage.toFixed(1)}%
              </Text>
            )}
          </HStack>
        </HStack>
      )}

      <Box
        w="full"
        h={`${height}px`}
        bg="whiteAlpha.100"
        borderRadius="full"
        overflow="hidden"
      >
        <MotionBox
          h="full"
          bg={colorStyles[colorScheme]}
          borderRadius="full"
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </Box>
    </VStack>
  );
}

// 环形进度条
interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  colorScheme?: 'brand' | 'green' | 'yellow' | 'red';
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  label,
  showValue = true,
  colorScheme = 'brand',
}: ProgressRingProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    brand: '#292FE1',
    green: '#22C55E',
    yellow: '#EAB308',
    red: '#EF4444',
  };

  return (
    <VStack gap={2}>
      <Box position="relative" w={size} h={size}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* 背景圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* 进度圆环 */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors[colorScheme]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* 中心内容 */}
        <VStack
          position="absolute"
          inset={0}
          justify="center"
          align="center"
          gap={0}
        >
          {showValue && (
            <Text fontSize="xl" fontWeight="bold" color="white">
              {percentage.toFixed(0)}%
            </Text>
          )}
        </VStack>
      </Box>
      {label && (
        <Text fontSize="sm" color="whiteAlpha.600">
          {label}
        </Text>
      )}
    </VStack>
  );
}

// 步骤进度条
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  return (
    <HStack w="full" justify="space-between" position="relative">
      {/* 背景线 */}
      <Box
        position="absolute"
        top="50%"
        left={0}
        right={0}
        h="2px"
        bg="whiteAlpha.200"
        transform="translateY(-50%)"
        zIndex={0}
      />

      {/* 进度线 */}
      <MotionBox
        position="absolute"
        top="50%"
        left={0}
        h="2px"
        bg="linear-gradient(90deg, #292FE1 0%, #D811F0 100%)"
        transform="translateY(-50%)"
        zIndex={1}
        initial={{ width: 0 }}
        animate={{
          width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* 步骤点 */}
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <VStack key={i} gap={1} zIndex={2}>
            <MotionBox
              w={isCurrent ? 5 : 4}
              h={isCurrent ? 5 : 4}
              borderRadius="full"
              bg={isCompleted || isCurrent ? '#292FE1' : 'whiteAlpha.300'}
              borderWidth={isCurrent ? 2 : 0}
              borderColor="#D811F0"
              initial={{ scale: 0.8 }}
              animate={{ scale: isCurrent ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            {labels && labels[i] && (
              <Text
                fontSize="xs"
                color={isCompleted || isCurrent ? 'white' : 'whiteAlpha.500'}
                textAlign="center"
              >
                {labels[i]}
              </Text>
            )}
          </VStack>
        );
      })}
    </HStack>
  );
}

export default ProgressBar;
