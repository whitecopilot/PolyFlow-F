import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入翻译文件
import zhHans from './locales/zh-Hans.json'
import zhHant from './locales/zh-Hant.json'
import en from './locales/en.json'
import ko from './locales/ko.json'
import ja from './locales/ja.json'

// 语言选项（菜单显示顺序：英文、繁体中文、韩文、日文）
// 注：简体中文翻译资源保留，但不在菜单中显示
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇭🇰' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
]

// 获取保存的语言，如果是简体中文则回退到英文
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem('i18nextLng')
  // 简体中文已从菜单移除，自动回退到英文
  if (saved === 'zh-Hans') {
    localStorage.setItem('i18nextLng', 'en')
    return 'en'
  }
  return saved || 'en'
}

i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 绑定 react-i18next
  .init({
    resources: {
      'zh-Hans': { translation: zhHans },
      'zh-Hant': { translation: zhHant },
      en: { translation: en },
      ko: { translation: ko },
      ja: { translation: ja },
    },
    fallbackLng: 'en', // 默认语言
    lng: getSavedLanguage(), // 从 localStorage 读取保存的语言
    
    interpolation: {
      escapeValue: false, // React 已经做了 XSS 防护
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

// 监听语言变化并保存到 localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng)
})

export default i18n
