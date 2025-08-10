import React, {useCallback, useMemo, useState} from 'react';
import './MathExpressionValidator.css';

// ==================== Type Definitions ====================
interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

interface FunctionRule {
  readonly minArgs: number;
  readonly maxArgs: number;
}

type CustomExpressionSet = ReadonlySet<string>;
type PredefinedFunctionMap = ReadonlyMap<string, FunctionRule>;

// ==================== Constants ====================
const CUSTOM_EXPRESSIONS: CustomExpressionSet = new Set([
  'SUM',
  'AVERAGE',
  'MAX',
  'MIN',
  'COUNT',
  'PRODUCT'
] as const);

const KNOWN_FUNCTIONS: PredefinedFunctionMap = new Map([
  ['ABS', { minArgs: 1, maxArgs: 1 }],
  ['POW', { minArgs: 2, maxArgs: 2 }],
  ['SQRT', { minArgs: 1, maxArgs: 1 }],
  ['LOG', { minArgs: 1, maxArgs: 1 }],
  ['SIN', { minArgs: 1, maxArgs: 1 }],
  ['COS', { minArgs: 1, maxArgs: 1 }],
  ['TAN', { minArgs: 1, maxArgs: 1 }],
  ['MAX_FUNC', { minArgs: 2, maxArgs: Infinity }],
  ['MIN_FUNC', { minArgs: 2, maxArgs: Infinity }]
] as const);

// ==================== Core Utility Functions ====================

/**
 * Advanced parameter parser - supports nested functions and complex expressions
 * Handles complex cases like MAX(ABS(-5), POW(2,3), {CUSTOM})
 */
const parseNestedArguments = (argsString: string): string[] => {
  if (argsString.trim() === '') return [];
  
  const args: string[] = [];
  let currentArg = '';
  let parenDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    switch (char) {
      case '(':
        parenDepth++;
        currentArg += char;
        break;
      case ')':
        parenDepth--;
        currentArg += char;
        break;
      case '{':
        braceDepth++;
        currentArg += char;
        break;
      case '}':
        braceDepth--;
        currentArg += char;
        break;
      case ',':
        if (parenDepth === 0 && braceDepth === 0) {
          const trimmedArg = currentArg.trim();
          if (trimmedArg) args.push(trimmedArg);
          currentArg = '';
        } else {
          currentArg += char;
        }
        break;
      default:
        currentArg += char;
    }
  }
  
  const finalArg = currentArg.trim();
  if (finalArg) args.push(finalArg);
  
  return args;
};

/**
 * Enhanced basic math syntax validator
 * Uses pure Regex implementation, covers all common syntax errors
 */
const validateMathSyntax = (expression: string): string[] => {
  const errors: string[] = [];

  // 1. Operator position checks
  if (/^\s*[*/]/.test(expression)) {
    errors.push('Expression cannot start with "*" or "/"');
  }

  if (/^\s*\+/.test(expression)) {
    errors.push('Expression cannot start with "+"');
  }

  if (/[+\-*/]\s*$/.test(expression)) {
    errors.push('Expression cannot end with an operator');
  }

  // 2. Consecutive operator checks (more precise rules)
  if (/[+*/]{2,}/.test(expression) || /[+*/]\s*[+*/]/.test(expression)) {
    errors.push('Cannot have consecutive operators');
  }

  // Handle special case for minus sign: allow "+-" but not other consecutive combinations
  if (!/[+-]\s*-/.test(expression) && /[+-]\s*[+-]/.test(expression)) {
    errors.push('Invalid operator combination');
  }

  // 3. Parentheses integrity check
  let parenCount = 0;
  
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    if (char === '(') {
      parenCount++;
    }
    if (char === ')') {
      parenCount--;
      if (parenCount < 0) {
        errors.push(`Position ${i}: Extra right parenthesis`);
        break;
      }
    }
  }
  
  if (parenCount > 0) {
    errors.push(`Missing ${parenCount} right parentheses`);
  }

  // 4. Empty parentheses and operator combination checks
  if (/\(\s*\)/.test(expression)) {
    errors.push('Cannot have empty parentheses');
  }

  if (/[+\-*/]\s*\)/.test(expression)) {
    errors.push('Operator cannot be directly followed by right parenthesis');
  }
  
  if (/\(\s*[*/]/.test(expression)) {
    errors.push('Left parenthesis cannot be directly followed by "*" or "/"');
  }

  if (/\(\s*\+/.test(expression)) {
    errors.push('Left parenthesis cannot be directly followed by "+"');
  }

  // 5. Number format validation
  if (/\d+\.{2,}/.test(expression) || /\.\d*\./.test(expression)) {
    errors.push('Invalid number format: multiple decimal points');
  }

  if (/\.\s*[+\-*/]/.test(expression) || /[+\-*/]\s*\.(?!\d)/.test(expression)) {
    errors.push('Invalid decimal point position');
  }

  // 6. Character validity check
  if (/[^a-zA-Z0-9+\-*/(){}.,_\s]/.test(expression)) {
    const invalidChars = expression.match(/[^a-zA-Z0-9+\-*/(){}.,_\s]/g);
    errors.push(`Contains invalid characters: ${[...new Set(invalidChars)].join(', ')}`);
  }

  // 7. Consecutive dot checks
  if (/\.{2,}/.test(expression)) {
    errors.push('Cannot have consecutive dots');
  }

  // 8. Special character checks
  if (/^[,.]$/.test(expression.trim())) {
    if (expression.trim() === ',') {
      errors.push('Contains invalid character: ,');
    } else if (expression.trim() === '.') {
      errors.push('Invalid decimal point position');
    }
  }

  return errors;
};

// ==================== Main Validation Logic ====================

/**
 * Complete mathematical expression validator
 * Integrates all validation rules, provides comprehensive error detection
 */
export const validateMathExpression = (
  expression: string,
  customExpressions: CustomExpressionSet = CUSTOM_EXPRESSIONS,
  predefinedFunctions: PredefinedFunctionMap = KNOWN_FUNCTIONS
): ValidationResult => {
  const errors: string[] = [];
  const trimmedExpression = expression.trim();

  // Empty value handling
  if (trimmedExpression === '') {
    return { isValid: true, errors: [] };
  }

  // === Phase 1: Structure Validation ===
  
  // 1. Custom expression validation in braces
  const bracePattern = new RegExp('{([^{}]*)}', 'g');
  const braceMatches = [...trimmedExpression.matchAll(bracePattern)];
  
  for (const match of braceMatches) {
    const content = match[1].trim();
    if (!content) {
      errors.push('Braces cannot be empty');
    } else if (!customExpressions.has(content)) {
      errors.push(`Unknown custom expression: {${content}}`);
    }
  }

  // Brace pairing check
  const openBraces = (trimmedExpression.match(/{/g) || []).length;
  const closeBraces = (trimmedExpression.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Unmatched braces (open: ${openBraces}, close: ${closeBraces})`);
  }

  // === Phase 2: Function Validation ===
  
  // 2. Function identification and authorization check - remove old logic, use new intelligent parsing method
  const functionMatches: Array<{name: string, start: number, end: number, argsString: string}> = [];
  let currentPos = 0;
  
  while (currentPos < trimmedExpression.length) {
    const match = trimmedExpression.slice(currentPos).match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
    if (!match) break;
    
    const funcName = match[1];
    const funcStart = currentPos + match.index! + match[0].length - 1; // Parenthesis start position
    let parenDepth = 1;
    let argsEnd = funcStart + 1;
    
    // Find corresponding right parenthesis
    for (let i = funcStart + 1; i < trimmedExpression.length; i++) {
      if (trimmedExpression[i] === '(') parenDepth++;
      else if (trimmedExpression[i] === ')') {
        parenDepth--;
        if (parenDepth === 0) {
          argsEnd = i;
          break;
        }
      }
    }
    
    if (parenDepth === 0) {
      const argsString = trimmedExpression.slice(funcStart + 1, argsEnd);
      functionMatches.push({
        name: funcName,
        start: currentPos + match.index!,
        end: argsEnd + 1,
        argsString
      });
    }
    
    currentPos = funcStart + 1;
  }
  
  // Validate found functions
  for (const funcMatch of functionMatches) {
    const funcName = funcMatch.name;
    
    if (predefinedFunctions.has(funcName)) {
      const rule = predefinedFunctions.get(funcName)!;
      const args = parseNestedArguments(funcMatch.argsString);
      
      // Empty parameter check
      if (args.some(arg => !arg.trim())) {
        errors.push(`${funcName}() contains empty parameters or format errors`);
        continue;
      }
      
      // Parameter count check
      if (args.length < rule.minArgs) {
        errors.push(
          `${funcName}() insufficient parameters: requires at least ${rule.minArgs}, provided ${args.length}`
        );
      } else if (rule.maxArgs !== Infinity && args.length > rule.maxArgs) {
        errors.push(
          `${funcName}() too many parameters: maximum ${rule.maxArgs}, provided ${args.length}`
        );
      }

      // Parameter content preliminary check
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (/^\s*[*/]/.test(arg) || /[+\-*/]\s*$/.test(arg)) {
          errors.push(`${funcName}() parameter ${i + 1} format error`);
        }
      }
    } else {
      errors.push(`Unauthorized function: ${funcName}() - only predefined functions allowed`);
    }
  }

  // === Phase 3: Syntax Validation ===
  
  // 4. Basic math syntax validation (only execute when previous checks pass)
  if (errors.length === 0) {
    let sanitizedExpression = trimmedExpression;
    
    // Clean custom expressions
    sanitizedExpression = sanitizedExpression.replace(bracePattern, '1');
    
    // Use intelligent method to clean all function calls
    let tempExpression = sanitizedExpression;
    let lastExpression = '';
    
    // Repeat cleaning until no changes, ensuring nested functions are completely cleaned
    while (tempExpression !== lastExpression) {
      lastExpression = tempExpression;
      
      // Find all function calls and replace with '1'
      const functionCallPattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g;
      let match: RegExpExecArray | null;
      
      while ((match = functionCallPattern.exec(tempExpression)) !== null) {
        const funcStart = match.index + match[0].length - 1; // Parenthesis start position
        let parenDepth = 1;
        let argsEnd = funcStart + 1;
        
        // Find corresponding right parenthesis
        for (let i = funcStart + 1; i < tempExpression.length; i++) {
          if (tempExpression[i] === '(') parenDepth++;
          else if (tempExpression[i] === ')') {
            parenDepth--;
            if (parenDepth === 0) {
              argsEnd = i;
              break;
            }
          }
        }
        
        if (parenDepth === 0) {
          // Replace entire function call
          const beforeFunc = tempExpression.slice(0, match.index);
          const afterFunc = tempExpression.slice(argsEnd + 1);
          tempExpression = beforeFunc + '1' + afterFunc;
          
          // Reset regex, because string length changed
          functionCallPattern.lastIndex = 0;
        }
      }
    }
    
    sanitizedExpression = tempExpression;

    // Execute syntax validation
    const syntaxErrors = validateMathSyntax(sanitizedExpression);
    errors.push(...syntaxErrors);
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze([...errors]) // Immutable error array
  };
};

// ==================== React Hook ====================

/**
 * High-performance mathematical expression validation Hook
 * Optimized for real-time validation, supports complex nesting and complete error detection
 */
export const useMathExpressionValidator = (
  expression: string,
  customExpressions: CustomExpressionSet = CUSTOM_EXPRESSIONS,
  predefinedFunctions: PredefinedFunctionMap = KNOWN_FUNCTIONS
): readonly [boolean, readonly string[]] => {
  return useMemo(() => {
    const result = validateMathExpression(expression, customExpressions, predefinedFunctions);
    return [result.isValid, result.errors] as const;
  }, [expression, customExpressions, predefinedFunctions]);
};

// ==================== Main Component ====================

interface MathExpressionValidatorProps {
  className?: string;
}

export const MathExpressionValidator: React.FC<MathExpressionValidatorProps> = ({ 
  className = '' 
}) => {
  const [expression, setExpression] = useState('');
  const [isValid, errors] = useMathExpressionValidator(expression);

  // Use useCallback to optimize event handling functions
  const handleExpressionChange = useCallback((value: string) => {
    setExpression(value);
  }, []);

  // Use useMemo to optimize list rendering
  const customExpressionsList = useMemo(() => (
    <div className="expression-list">
      <h3>Custom Expression List A:</h3>
      <ul>
        {Array.from(CUSTOM_EXPRESSIONS).map(expr => (
          <li key={expr} className="expression-item">
            {`{${expr}}`}
          </li>
        ))}
      </ul>
    </div>
  ), []);

  const knownExpressionsList = useMemo(() => (
    <div className="expression-list">
      <h3>Known Expression List B:</h3>
      <ul>
        {Array.from(KNOWN_FUNCTIONS.entries()).map(([funcName, rule]) => (
          <li key={funcName} className="expression-item">
            {`${funcName}(parameters: ${rule.minArgs}${rule.maxArgs !== Infinity ? `-${rule.maxArgs}` : '+'})`}
          </li>
        ))}
      </ul>
    </div>
  ), []);

  return (
    <div className={`math-expression-validator ${className}`}>
      <h2>Mathematical Expression Validator</h2>
      
      <div className="input-section">
        <label htmlFor="math-expression" className="input-label">
          Enter mathematical expression:
        </label>
        <input
          id="math-expression"
          type="text"
          value={expression}
          onChange={(e) => handleExpressionChange(e.target.value)}
          className={`expression-input ${!isValid ? 'error' : ''}`}
          placeholder="e.g., 1 + {SUM} * ABS(x) / 2"
        />
      </div>

      <div className="validation-result">
        <div className={`result-indicator ${isValid ? 'valid' : 'invalid'}`}>
          {isValid ? '✓ Expression is valid' : '✗ Expression is invalid'}
        </div>
        
        {errors.length > 0 && (
          <div className="error-list">
            <h4>Error details:</h4>
            <ul>
              {errors.map((error, index) => (
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