import {lazy, Suspense, useMemo, useState} from 'react'
import './App.css'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from './api/core/queryClient'
import DialogManager from './components/dialog-manager/DialogManager'
import {useDialogStore} from './stores/dialogStore'

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
                <div style={{marginBottom: 16}}>
                    <button
                        onClick={() => {
                            const {openDialog, setDialogLoading} = useDialogStore.getState();
                            openDialog(
                                'dialogA',
                                {message: '這是A的內容', count: 1},
                                (data) => {
                                    console.log('DialogA submit callback:', data);
                                    alert('DialogA submit callback: ' + JSON.stringify(data));
                                }
                            );
                            setDialogLoading('dialogA', true);
                            setTimeout(() => {
                                setDialogLoading('dialogA', false);
                            }, 3000);
                        }}
                    >
                        開啟 DialogA
                    </button>
                    <button
                        onClick={() => {
                            const {openDialog, setDialogLoading} = useDialogStore.getState();
                            openDialog(
                                'dialogB',
                                {value: 999, extra: '這是B的額外內容'},
                                (data) => {
                                    console.log('DialogB submit callback:', data);
                                    alert('DialogB submit callback: ' + JSON.stringify(data));
                                }
                            );
                            setDialogLoading('dialogB', true);
                            setTimeout(() => {
                                setDialogLoading('dialogB', false);
                            }, 3000);
                        }}
                    >
                        開啟 DialogB
                    </button>
                </div>
                <Suspense fallback={<div className="loading">Loading...</div>}>
                    {activeTab === 'query-hooks' && (
                        <QueryClientProvider client={queryClient}>
                            <QueryHooksDemo/>
                        </QueryClientProvider>
                    )}
                    {activeTab === 'http-client' && (
                        <HttpClientDemo/>
                    )}
                </Suspense>
            </main>
            <footer className="app-footer">
                <p>React API Call Patterns Comparison © {new Date().getFullYear()}</p>
            </footer>
            <DialogManager/>
        </div>
    )
}

export default App
