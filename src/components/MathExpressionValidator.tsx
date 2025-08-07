import React, { useState, useCallback, useMemo } from 'react';
import './MathExpressionValidator.css';

// 客製化數學運算式列表 A
const CUSTOM_EXPRESSIONS = [
  'SUM',
  'AVERAGE',
  'MAX',
  'MIN',
  'COUNT',
  'PRODUCT'
] as const;

// 已知運算式列表 B 及其規則
const KNOWN_EXPRESSIONS = {
  'ABS': { params: 1, pattern: /^ABS\([^,)]+\)$/ },
  'POW': { params: 2, pattern: /^POW\([^,)]+,[^,)]+\)$/ },
  'SQRT': { params: 1, pattern: /^SQRT\([^,)]+\)$/ },
  'LOG': { params: 1, pattern: /^LOG\([^,)]+\)$/ },
  'SIN': { params: 1, pattern: /^SIN\([^,)]+\)$/ },
  'COS': { params: 1, pattern: /^COS\([^,)]+\)$/ },
  'TAN': { params: 1, pattern: /^TAN\([^,)]+\)$/ }
} as const;

// 驗證結果型別
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 驗證函數
export const validateMathExpression = (expression: string): ValidationResult => {
  const errors: string[] = [];

  // 1. 驗證大括號內容是否為列表A中的已知運算式
  const bracePattern = /\{([^}]*)\}/g;
  let braceMatch;
  
  while ((braceMatch = bracePattern.exec(expression)) !== null) {
    const content = braceMatch[1].trim();
    if (!CUSTOM_EXPRESSIONS.includes(content as any)) {
      errors.push(`大括號內容 "${content}" 不是有效的客製化運算式`);
    }
  }

  // 2. 驗證列表B中的運算式是否符合規則
  Object.entries(KNOWN_EXPRESSIONS).forEach(([funcName, rules]) => {
    const funcPattern = new RegExp(`${funcName}\\([^)]*\\)`, 'g');
    let funcMatch;
    
    while ((funcMatch = funcPattern.exec(expression)) !== null) {
      const funcCall = funcMatch[0];
      if (!rules.pattern.test(funcCall)) {
        errors.push(`${funcName} 函數參數數量或格式不正確`);
      }
    }
  });

  // 3. 驗證整體數學運算式語法
  const cleanExpression = expression
    .replace(/\{[^}]*\}/g, 'VALID_CUSTOM') // 替換大括號為標記
    .replace(/[A-Z]+\([^)]*\)/g, 'VALID_FUNC'); // 替換函數為標記

  // 基本數學運算式驗證
  const mathPattern = /^[0-9+\-*/().\sVALID_CUSTOMVALID_FUNC]+$/;
  if (!mathPattern.test(cleanExpression)) {
    errors.push('包含無效的數學運算式符號');
  }

  // 檢查是否有不完整的運算符
  const incompleteOperatorPattern = /[+\-*/]\s*$/;
  if (incompleteOperatorPattern.test(expression)) {
    errors.push('運算式結尾有未完成的運算符');
  }

  // 檢查括號配對
  const openBrackets = (expression.match(/\(/g) || []).length;
  const closeBrackets = (expression.match(/\)/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('括號數量不匹配');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 主元件
interface MathExpressionValidatorProps {
  className?: string;
}

export const MathExpressionValidator: React.FC<MathExpressionValidatorProps> = ({ 
  className = '' 
}) => {
  const [expression, setExpression] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: []
  });

  // 使用 useCallback 優化驗證函數
  const handleExpressionChange = useCallback((value: string) => {
    setExpression(value);
    
    if (value.trim() === '') {
      setValidationResult({ isValid: true, errors: [] });
      return;
    }

    const result = validateMathExpression(value);
    setValidationResult(result);
  }, []);

  // 使用 useMemo 優化列表渲染
  const customExpressionsList = useMemo(() => (
    <div className="expression-list">
      <h3>客製化運算式列表 A:</h3>
      <ul>
        {CUSTOM_EXPRESSIONS.map(expr => (
          <li key={expr} className="expression-item">
            {`{${expr}}`}
          </li>
        ))}
      </ul>
    </div>
  ), []);

  const knownExpressionsList = useMemo(() => (
    <div className="expression-list">
      <h3>已知運算式列表 B:</h3>
      <ul>
        {Object.entries(KNOWN_EXPRESSIONS).map(([funcName, rules]) => (
          <li key={funcName} className="expression-item">
            {`${funcName}(參數數量: ${rules.params})`}
          </li>
        ))}
      </ul>
    </div>
  ), []);

  return (
    <div className={`math-expression-validator ${className}`}>
      <h2>數學運算式驗證器</h2>
      
      <div className="input-section">
        <label htmlFor="math-expression" className="input-label">
          輸入數學運算式:
        </label>
        <input
          id="math-expression"
          type="text"
          value={expression}
          onChange={(e) => handleExpressionChange(e.target.value)}
          className={`expression-input ${!validationResult.isValid ? 'error' : ''}`}
          placeholder="例如: 1 + {SUM} * ABS(x) / 2"
        />
      </div>

      <div className="validation-result">
        <div className={`result-indicator ${validationResult.isValid ? 'valid' : 'invalid'}`}>
          {validationResult.isValid ? '✓ 運算式有效' : '✗ 運算式無效'}
        </div>
        
        {validationResult.errors.length > 0 && (
          <div className="error-list">
            <h4>錯誤詳情:</h4>
            <ul>
              {validationResult.errors.map((error, index) => (
                <li key={index} className="error-item">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="expression-lists">
        {customExpressionsList}
        {knownExpressionsList}
      </div>
    </div>
  );
};

export default MathExpressionValidator; 