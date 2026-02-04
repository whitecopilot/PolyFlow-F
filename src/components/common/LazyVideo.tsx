// 延迟加载视频组件
// 使用 Intersection Observer 实现视口内加载，避免阻塞主线程

import { Box } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

interface LazyVideoProps {
  src: string
  width?: string | number
  height?: string | number
  borderRadius?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  // 宽高比，用于 height="auto" 的情况，如 "16/9" 或 "1/1"
  aspectRatio?: string
  // 预加载阈值，0 表示完全进入视口才加载，1 表示提前一个视口高度加载
  threshold?: number
  // 根边距，用于提前触发加载
  rootMargin?: string
}

export function LazyVideo({
  src,
  width = '100%',
  height = '100%',
  borderRadius = '0',
  objectFit = 'cover',
  aspectRatio,
  threshold = 0,
  rootMargin = '100px 0px', // 默认提前 100px 加载
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // 处理 height="auto" 的情况
  const isAutoHeight = height === 'auto'
  const containerStyle: React.CSSProperties = isAutoHeight
    ? { aspectRatio: aspectRatio || '16/9' }
    : {}

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            // 一旦进入视口，停止观察
            observer.unobserve(container)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  // 视频加载完成后隐藏骨架屏
  const handleLoadedData = () => {
    setIsLoaded(true)
  }

  return (
    <Box
      ref={containerRef}
      position="relative"
      width={width}
      height={isAutoHeight ? undefined : height}
      borderRadius={borderRadius}
      overflow="hidden"
      bg="#2A2A30"
      style={containerStyle}
    >
      {/* 骨架屏占位 - 使用简单的闪烁动画 */}
      {!isLoaded && (
        <Box
          position="absolute"
          inset={0}
          borderRadius={borderRadius}
          bg="#2A2A30"
          animation="pulse 1.5s ease-in-out infinite"
          css={{
            '@keyframes pulse': {
              '0%, 100%': { backgroundColor: '#2A2A30' },
              '50%': { backgroundColor: '#3A3A40' },
            },
          }}
        />
      )}

      {/* 视频元素 - 仅在进入视口后渲染 */}
      {isInView && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleLoadedData}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            display: isLoaded ? 'block' : 'none',
          }}
        />
      )}
    </Box>
  )
}
