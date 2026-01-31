import { Box, type BoxProps } from '@chakra-ui/react'

interface PolyFlowLogoProps extends BoxProps {
  size?: number | string
  showText?: boolean
  /** Logo 颜色模式: gradient-渐变色, white-白色, currentColor-继承颜色 */
  colorMode?: 'gradient' | 'white' | 'currentColor'
}

/**
 * PolyFlow Logo 组件
 * 基于官方 Logo SVG，去掉背景圆形，只保留内部分子结构图案
 */
export function PolyFlowLogo({
  size = 28,
  showText = false,
  colorMode = 'gradient',
  ...props
}: PolyFlowLogoProps) {
  // 根据颜色模式决定填充色
  const topColor = colorMode === 'white' ? 'white' : colorMode === 'currentColor' ? 'currentColor' : '#B129CF'
  const bottomColor = colorMode === 'white' ? 'white' : colorMode === 'currentColor' ? 'currentColor' : '#2A2FD8'

  return (
    <Box display="flex" alignItems="center" gap={2} {...props}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 右侧圆点 - 蓝色 */}
        <circle cx="17.5" cy="14.5" r="2.5" fill={bottomColor} />

        {/* 顶部分子结构 - 三个相连的圆 - 紫色 */}
        <path
          d="M13.4248 9.91852C12.9871 10.5719 12.2553 11 11.4265 11C10.0864 11 9 9.88072 9 8.50001C9 7.11928 10.0864 6 11.4265 6C12.274 6 13.0199 6.44763 13.4539 7.12592H13.4542C13.6896 7.45798 14.0704 7.6737 14.5 7.6737C14.9296 7.6737 15.3104 7.45798 15.5458 7.12592H15.5461C15.9801 6.44763 16.7261 6 17.5735 6C18.9136 6 20 7.11928 20 8.50001C20 9.88072 18.9136 11 17.5735 11C16.7447 11 16.0129 10.5719 15.5752 9.91852H15.5741C15.3417 9.56297 14.9473 9.32912 14.5 9.32912C14.0526 9.32912 13.6583 9.56297 13.4259 9.91852H13.4248Z"
          fill={topColor}
        />

        {/* 左侧分子结构 - 三个垂直相连的圆 - 蓝色 */}
        <path
          d="M10.0815 16.4248C9.42814 15.987 9 15.2553 9 14.4265C9 13.0864 10.1193 12 11.5 12C12.8807 12 14 13.0864 14 14.4265C14 15.2739 13.5524 16.0199 12.8741 16.4539V16.4542C12.542 16.6896 12.3263 17.0703 12.3263 17.5C12.3263 17.9296 12.542 18.3104 12.8741 18.5457V18.5461C13.5524 18.98 14 19.726 14 20.5734C14 21.9136 12.8807 23 11.5 23C10.1193 23 9 21.9136 9 20.5734C9 19.7447 9.42814 19.0129 10.0815 18.5752V18.5741C10.437 18.3417 10.6709 17.9473 10.6709 17.5C10.6709 17.0526 10.437 16.6583 10.0815 16.4259V16.4248Z"
          fill={bottomColor}
        />
      </svg>

      {showText && (
        <Box
          as="span"
          fontSize="lg"
          fontWeight="semibold"
          color="white"
          letterSpacing="tight"
        >
          PolyFlow
        </Box>
      )}
    </Box>
  )
}

/**
 * PolyFlow Logo 图标 - 仅图标版本
 */
export function PolyFlowIcon({
  size = 24,
  colorMode = 'gradient',
  ...props
}: Omit<PolyFlowLogoProps, 'showText'>) {
  return <PolyFlowLogo size={size} showText={false} colorMode={colorMode} {...props} />
}
