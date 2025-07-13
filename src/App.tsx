import {lazy, Suspense, useMemo, useState, useEffect} from 'react'
import './App.css'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from './api/core/queryClient'
import DialogManager from './components/dialog-manager/DialogManager'
import {useDialogStore} from './stores/dialogStore'
import httpClient from './api/core/HttpClient'
import { DialogType } from './types/dialog'
import { registerKeycloakRefreshHandler } from './keycloakUtils'

// 使用懶加載
const QueryHooksDemo = lazy(() => import('./components/QueryHooksDemo'))
const HttpClientDemo = lazy(() => import('./components/HttpClientDemo'))

// 定義類型
type TabType = 'query-hooks' | 'http-client'

const App = () => {
    const [activeTab, setActiveTab] = useState<TabType>('query-hooks')

    // App 啟動時設定 base url 並註冊 keycloak refresh handler
    useEffect(() => {
        httpClient.setBaseUrl('https://jsonplaceholder.typicode.com');
        registerKeycloakRefreshHandler();
    }, []);

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

    // 模擬登入，設定 Authorization header
    const handleLogin = () => {
        httpClient.setHeader('Authorization', 'Bearer mock_token_123');
        alert('已設定 Authorization header，之後所有 API 都會帶上');
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>React API Call Patterns</h1>
                {TabButtons}
            </header>
            <main className="app-content">
                <div style={{marginBottom: 16}}>
                    <button onClick={handleLogin} style={{marginRight: 8}}>模擬登入（設定 Authorization header）</button>
                    <button
                        onClick={() => {
                            const { openDialog } = useDialogStore.getState();
                            openDialog(
                                DialogType.DialogA,
                                {
                                    isOpen: true,
                                    onClose: () => useDialogStore.getState().closeDialog(DialogType.DialogA),
                                    onCreate: (groupName: string) => alert('建立A: ' + groupName),
                                    abTypeName: 'A群組',
                                    sourceName: '來源A',
                                    sourceID: 'A001',
                                    isLoading: false,
                                } as import('./types/dialog').DialogAProps
                            );
                        }}
                    >
                        開啟 DialogA
                    </button>
                    <button
                        onClick={() => {
                            const { openDialog } = useDialogStore.getState();
                            openDialog(
                                DialogType.DialogB,
                                {
                                    isOpen: true,
                                    onClose: () => useDialogStore.getState().closeDialog(DialogType.DialogB),
                                    onCreate: (groupName: string) => alert('建立B: ' + groupName),
                                    abTypeName: 'B群組',
                                    sourceName: '來源B',
                                    isLoading: false,
                                } as import('./types/dialog').DialogBProps
                            );
                        }}
                    >
                        開啟 DialogB
                    </button>
                    <button
                        onClick={() => {
                            const { openDialog } = useDialogStore.getState();
                            openDialog(
                                DialogType.DialogC,
                                {
                                    isOpen: true,
                                    onClose: () => useDialogStore.getState().closeDialog(DialogType.DialogC),
                                    onCreate: (groupName: string) => alert('建立C: ' + groupName),
                                    abTypeName: 'C群組',
                                    isLoading: false,
                                } as import('./types/dialog').DialogCProps
                            );
                        }}
                    >
                        開啟 DialogC
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
