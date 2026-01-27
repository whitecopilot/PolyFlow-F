import { useTranslation } from 'react-i18next'

export function TestI18n() {
  const { t, i18n } = useTranslation()

  return (
    <div style={{ padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>i18n Test Page</h1>
      <p>Current Language: {i18n.language}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>App Name: {t('app.name')}</h3>
        <p>Home: {t('nav.home')}</p>
        <p>Assets: {t('nav.assets')}</p>
        <p>Language: {t('header.language')}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => i18n.changeLanguage('zh-Hans')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          简体中文
        </button>
        <button 
          onClick={() => i18n.changeLanguage('zh-Hant')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          繁體中文
        </button>
        <button 
          onClick={() => i18n.changeLanguage('en')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          English
        </button>
        <button 
          onClick={() => i18n.changeLanguage('ko')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          한국어
        </button>
        <button 
          onClick={() => i18n.changeLanguage('ja')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          日本語
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#333' }}>
        <h4>Debug Info:</h4>
        <pre>{JSON.stringify({
          language: i18n.language,
          languages: i18n.languages,
          hasResourceBundle: (i18n as any).store?.data ? 'Yes' : 'No'
        }, null, 2)}</pre>
      </div>
    </div>
  )
}
