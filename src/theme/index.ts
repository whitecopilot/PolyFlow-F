import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

/**
 * PolyFlow 设计规范 - 基于 app.polyflow.tech 实际站点
 *
 * 颜色系统：
 * - 主背景：#000000 (纯黑)
 * - 卡片背景：#17171C (深灰偏蓝)
 * - 次级背景：#2F2F33 (中灰)
 * - 边框：#454549
 * - 主按钮：#292FE1 (蓝紫色)
 * - 渐变：#171CA2 → #D811F0 (蓝到粉紫)
 */

const config = defineConfig({
  globalCss: {
    'html, body': {
      bg: 'bg.canvas',
      color: 'text.primary',
      minHeight: '100vh',
      fontFamily: 'body',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: '"Exo 2", "Inter", system-ui, sans-serif' },
        body: { value: '"Inter", system-ui, sans-serif' },
      },
      colors: {
        // 主色调 - 蓝紫色系 (基于 PolyFlow 实际配色)
        brand: {
          50: { value: '#EEEEFF' },
          100: { value: '#D8DAFF' },
          200: { value: '#B3B7FF' },
          300: { value: '#8A8FFF' },
          400: { value: '#5A61F0' },
          500: { value: '#292FE1' }, // 主色 - PolyFlow 主按钮色
          600: { value: '#2328C4' },
          700: { value: '#171CA2' }, // 渐变起点
          800: { value: '#131780' },
          900: { value: '#0E1160' },
        },
        // 强调色 - 渐变终点和装饰色
        accent: {
          purple: { value: '#8B5CF6' },
          pink: { value: '#D811F0' },    // 渐变终点
          magenta: { value: '#C20ED7' }, // 卡片渐变
          cyan: { value: '#22D3EE' },
          green: { value: '#10B981' },
          orange: { value: '#F59E0B' },
        },
        // 深色背景系统 - PolyFlow 实际配色
        dark: {
          950: { value: '#111111' }, // 主背景 - 深灰（带渐变光晕）
          900: { value: '#0A0A0A' }, // 深背景
          800: { value: '#17171C' }, // 卡片背景
          700: { value: '#1F1F24' }, // 卡片 hover
          600: { value: '#2F2F33' }, // 次级背景/输入框
          500: { value: '#454549' }, // 边框
          400: { value: '#5D5D61' }, // 分割线
          300: { value: '#8A8B8D' }, // 次要文字
        },
        // 文字颜色
        text: {
          primary: { value: '#FFFFFF' },
          secondary: { value: '#8A8B8D' },  // 次要文字
          muted: { value: '#5D5D61' },      // 禁用文字
          disabled: { value: '#454549' },
        },
      },
      radii: {
        sm: { value: '8px' },      // 小圆角 - 边框按钮、输入框
        md: { value: '12px' },     // 中圆角 - 主按钮
        lg: { value: '16px' },     // 大圆角 - 卡片
        card: { value: '16px' },
        button: { value: '12px' },
        input: { value: '8px' },
        full: { value: '9999px' }, // 胶囊形状
      },
      shadows: {
        card: { value: '0 0 20px rgba(0, 0, 0, 0.25)' }, // PolyFlow 卡片阴影
        glow: { value: '0 0 20px rgba(41, 47, 225, 0.3)' },
        'glow-lg': { value: '0 0 40px rgba(41, 47, 225, 0.4)' },
        'glow-pink': { value: '0 0 30px rgba(216, 17, 240, 0.3)' },
      },
    },
    semanticTokens: {
      colors: {
        // 背景色
        'bg.canvas': { value: '{colors.dark.950}' },     // 主背景 - 纯黑
        'bg.card': { value: '{colors.dark.800}' },       // 卡片背景
        'bg.cardHover': { value: '{colors.dark.700}' },  // 卡片 hover
        'bg.input': { value: '{colors.dark.600}' },      // 输入框背景
        'bg.elevated': { value: '{colors.dark.600}' },   // 凸起元素
        // 边框
        'border.default': { value: '{colors.dark.500}' },
        'border.subtle': { value: '{colors.dark.400}' },
        // 文字
        'text.primary': { value: '{colors.text.primary}' },
        'text.secondary': { value: '{colors.text.secondary}' },
        'text.muted': { value: '{colors.text.muted}' },
        // 品牌色
        'brand.primary': { value: '{colors.brand.500}' },
        'brand.hover': { value: '{colors.brand.600}' },
        'brand.gradient.start': { value: '{colors.brand.700}' },
        'brand.gradient.end': { value: '{colors.accent.pink}' },
        // 状态色
        'success': { value: '{colors.accent.green}' },
        'warning': { value: '{colors.accent.orange}' },
        'error': { value: '#EF4444' },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
