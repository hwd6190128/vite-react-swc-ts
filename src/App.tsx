import React from 'react';
import './App.css';
import HttpClientDemo from './components/HttpClientDemo';
import QueryHooksDemo from './components/QueryHooksDemo';
import MathExpressionValidator from './components/MathExpressionValidator';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/core/queryClient';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React SWC TypeScript 專案</h1>
      </header>
      
      <main className="App-main">
        <section className="demo-section">
          <h2>數學運算式驗證器</h2>
          <MathExpressionValidator />
        </section>
        
        <section className="demo-section">
          <h2>HTTP Client 示範</h2>
          <HttpClientDemo />
        </section>
        
        <section className="demo-section">
          <h2>Query Hooks 示範</h2>
          <QueryClientProvider client={queryClient}>
            <QueryHooksDemo />
          </QueryClientProvider>
        </section>
      </main>
    </div>
  );
}

export default App;
