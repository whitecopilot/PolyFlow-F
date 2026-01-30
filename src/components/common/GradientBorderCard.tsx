// 渐变边框卡片组件

import { Box, type BoxProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface GradientBorderCardProps extends BoxProps {
  children: React.ReactNode;
  animate?: boolean;
  borderWidth?: number;
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  /** 使用静态白色边框而不是动画渐变 */
  staticBorder?: boolean;
}

const MotionBox = motion.create(Box);

export function GradientBorderCard({
  children,
  animate = true,
  borderWidth = 2,
  glowIntensity = 'medium',
  staticBorder = false,
  ...props
}: GradientBorderCardProps) {
  const glowStyles = {
    none: {},
    low: {
      boxShadow: '0 0 15px rgba(255, 255, 255, 0.03)',
    },
    medium: {
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.05), 0 0 40px rgba(150, 150, 150, 0.03)',
    },
    high: {
      boxShadow: '0 0 25px rgba(255, 255, 255, 0.08), 0 0 50px rgba(150, 150, 150, 0.05)',
    },
  };

  return (
    <Box
      position="relative"
      borderRadius="xl"
      p={`${borderWidth}px`}
      overflow="hidden"
      {...glowStyles[glowIntensity]}
      {...props}
    >
      {/* 渐变边框背景 */}
      {staticBorder ? (
        <Box
          position="absolute"
          inset={0}
          bg="rgba(255, 255, 255, 0.6)"
          borderRadius="xl"
        />
      ) : (
        <MotionBox
          position="absolute"
          inset={0}
          bg="linear-gradient(135deg, #000000 0%, #333333 25%, #FFFFFF 50%, #333333 75%, #000000 100%)"
          backgroundSize="400% 400%"
          animate={animate ? {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          } : undefined}
          transition={animate ? {
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          } : undefined}
          borderRadius="xl"
        />
      )}

      {/* 内容区域 */}
      <Box
        position="relative"
        bg="#17171C"
        borderRadius="lg"
        overflow="hidden"
      >
        {children}
      </Box>
    </Box>
  );
}

export default GradientBorderCard;
