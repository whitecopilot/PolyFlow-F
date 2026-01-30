import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

/**
 * PolyFlow 设计规范 - 黑白高级简约风格
 *
 * 颜色系统：
 * - 主背景：#111111 (深黑)
 * - 卡片背景：#17171C (深灰)
 * - 次级背景：#2F2F33 (中灰)
 * - 边框：#454549
 * - 主按钮：#2D2D31 (深灰黑)
 * - 渐变：#000000 → #FFFFFF (黑到白)
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
        // 主色调 - 黑灰色系 (高级简约风格)
        brand: {
          50: { value: '#F5F5F5' },
          100: { value: '#E5E5E5' },
          200: { value: '#D4D4D4' },
          300: { value: '#A3A3A3' },
          400: { value: '#737373' },
          500: { value: '#2D2D31' }, // 主色 - 深灰黑按钮
          600: { value: '#3D3D41' },
          700: { value: '#4D4D51' },
          800: { value: '#1A1A1D' },
          900: { value: '#0A0A0A' },
        },
        // 强调色 - 黑白主题装饰色
        accent: {
          purple: { value: '#6B7280' },
          pink: { value: '#9CA3AF' },    // 渐变终点（浅灰）
          magenta: { value: '#D1D5DB' }, // 卡片渐变（白灰）
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
        card: { value: '0 0 20px rgba(0, 0, 0, 0.25)' },
        glow: { value: '0 0 20px rgba(255, 255, 255, 0.15)' },
        'glow-lg': { value: '0 0 40px rgba(255, 255, 255, 0.2)' },
        'glow-pink': { value: '0 0 30px rgba(180, 180, 180, 0.2)' },
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
