import {useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ApiProvider} from './api/core/ApiProvider'
import {ApiServiceDemo} from './components/ApiServiceDemo'
import {useQueryClient} from "@tanstack/react-query";

function AppContent() {
    const [count, setCount] = useState(0)
    const [demoMode, setDemoMode] = useState<'api' | 'service' | 'none'>('none')
    const queryClient = useQueryClient()

    return (
        <div className="App">
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>React API Library Demo</h1>

            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <button
                    onClick={() => void queryClient.invalidateQueries()}
                    style={{marginLeft: '10px', background: '#2196f3'}}
                >
                    Refresh All Queries
                </button>
            </div>

            <div className="demo-selector">
                <button
                    className={demoMode === 'api' ? 'active' : ''}
                    onClick={() => setDemoMode('api')}
                >
                    API Hooks Demo
                </button>
                <button
                    className={demoMode === 'service' ? 'active' : ''}
                    onClick={() => setDemoMode('service')}
                >
                    Service API Demo
                </button>
                <button
                    className={demoMode === 'none' ? 'active' : ''}
                    onClick={() => setDemoMode('none')}
                >
                    Clear
                </button>
            </div>

            <div className="demo-container">
                {demoMode === 'service' && <ApiServiceDemo/>}
                {demoMode === 'none' && (
                    <div className="empty-state">
                        <h2>Please Select a Demo Mode</h2>
                        <p>Click one of the buttons above to view a demo.</p>
                    </div>
                )}
            </div>

            <p className="read-the-docs">
                Unified API architecture using React Query and Axios
            </p>
        </div>
    )
}

function App() {
    return (
        <ApiProvider>
            <AppContent/>
        </ApiProvider>
    )
}

export default App
