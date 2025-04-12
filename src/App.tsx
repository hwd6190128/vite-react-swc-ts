import { useState, useMemo, lazy, Suspense } from 'react'
import './App.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/core/queryClient'

// 使用懶加載
const QueryHooksDemo = lazy(() => import('./components/QueryHooksDemo'))
const HttpClientDemo = lazy(() => import('./components/HttpClientDemo'))

// 定義類型
type TabType = 'query-hooks' | 'http-client'

const App = () => {
    const [activeTab, setActiveTab] = useState<TabType>('query-hooks')

    // 使用記憶化Tab按鈕以提高性能
    const TabButtons = useMemo(() => (
        <div className="tab-buttons">
            <button
                className={activeTab === 'query-hooks' ? 'active' : ''}
                onClick={() => setActiveTab('query-hooks')}
            >
                QueryHooks Pattern
            </button>
            <button
                className={activeTab === 'http-client' ? 'active' : ''}
                onClick={() => setActiveTab('http-client')}
            >
                HttpClient Pattern
            </button>
        </div>
    ), [activeTab])

    return (
        <div className="app">
            <header className="app-header">
                <h1>React API Call Patterns</h1>
                {TabButtons}
            </header>
            <main className="app-content">
                <Suspense fallback={<div className="loading">Loading...</div>}>
                    {activeTab === 'query-hooks' && (
                        <QueryClientProvider client={queryClient}>
                            <QueryHooksDemo />
                        </QueryClientProvider>
                    )}
                    {activeTab === 'http-client' && (
                        <HttpClientDemo />
                    )}
                </Suspense>
            </main>
            <footer className="app-footer">
                <p>React API Call Patterns Comparison © {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}

export default App
