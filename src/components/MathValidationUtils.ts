import * as math from "mathjs";
import {AvailableFunction, AvailableIndicator, ValidationResult} from "./useMathValidator.tsx";

const INDICATOR_REGEX = /{([^}]*)}/g;
const OPEN_BRACE_REGEX = /{/g;
const CLOSE_BRACE_REGEX = /}/g;
// 處理巢狀結構的函數正則表達式
const FUNCTION_REGEX = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(((?:[^()]|\([^()]*\))*)\)/g;
const NUMERIC_REGEX = /^\d+(\.\d+)?$/;
const INDICATOR_WRAPPER_REGEX = /^{([^}]+)}$/;

// 1. 驗證大括號中的指標
export const validateIndicators = (expression: string, availableIndicators: AvailableIndicator[]): string[] => {
    const indicatorErrors: string[] = [];
    const indicatorRegex = INDICATOR_REGEX;
    const validIndicators = new Set(availableIndicators.map(ind => ind.indicator));
    let match;

    while ((match = indicatorRegex.exec(expression)) !== null) {
        const indicatorContent = match[1].trim();

        if (!indicatorContent) {
            indicatorErrors.push('Empty indicator found: {}');
        } else if (!validIndicators.has(indicatorContent)) {
            indicatorErrors.push(`Invalid indicator: {${indicatorContent}}`);
        }
    }

    // 檢查是否有未配對的大括號
    const openBraces = (expression.match(OPEN_BRACE_REGEX) || []).length;
    const closeBraces = (expression.match(CLOSE_BRACE_REGEX) || []).length;

    if (openBraces !== closeBraces) {
        indicatorErrors.push('Mismatched braces in expression');
    }

    return indicatorErrors;
};

// 2. 驗證函數調用（保持原有邏輯，確保參數只能是數字、指標或嵌套函數）
export const validateFunctions = (expression: string, availableIndicators: AvailableIndicator[], availableFunctions: AvailableFunction[]): string[] => {
    const functionErrors: string[] = [];

    // 建立函數名稱到參數數量的映射
    const functionMap = new Map<string, number>();
    availableFunctions.forEach(func => {
        const funcName = func.label.split('(')[0];
        const paramCount = (func.value.match(/,/g) || []).length + 1;
        functionMap.set(funcName, paramCount);
    });

    const functionNames = Array.from(functionMap.keys());
    if (functionNames.length === 0) return functionErrors;

    // 解析參數的輔助函數（處理嵌套括號）
    const parseParameters = (paramStr: string): string[] => {
        if (!paramStr.trim()) return [];

        const params: string[] = [];
        let current = '';
        let depth = 0;

        for (let i = 0; i < paramStr.length; i++) {
            const char = paramStr[i];

            if (char === '(') {
                depth++;
                current += char;
            } else if (char === ')') {
                depth--;
                current += char;
            } else if (char === ',' && depth === 0) {
                params.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            params.push(current.trim());
        }

        return params;
    };

    // 遞歸驗證參數是否為有效的數字、指標或函數調用
    const isValidParameter = (param: string): boolean => {
        const trimmedParam = param.trim();

        if (!trimmedParam) return false;

        // 檢查是否為數字（包含小數）
        if (NUMERIC_REGEX.test(trimmedParam)) {
            return true;
        }

        // 檢查是否為指標 {xxx}
        const indicatorMatch = trimmedParam.match(INDICATOR_WRAPPER_REGEX);
        if (indicatorMatch) {
            const indicatorName = indicatorMatch[1].trim();
            return availableIndicators.some(ind => ind.indicator === indicatorName);
        }

        // 檢查是否為有效的函數調用
        const functionMatch = trimmedParam.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(((?:[^()]|\([^()]*\))*)\)$/);
        if (functionMatch) {
            const [, funcName, funcParams] = functionMatch;

            if (!functionMap.has(funcName)) {
                return false;
            }

            const expectedParamCount = functionMap.get(funcName)!;

            if (!funcParams.trim()) {
                return expectedParamCount === 1 && !funcParams; // 空參數只在單參數函數且確實為空時有效
            }

            // 解析參數
            const params = parseParameters(funcParams);

            if (params.length !== expectedParamCount) {
                return false;
            }

            // 遞歸驗證每個參數
            return params.every(p => isValidParameter(p));
        }

        return false;
    };

    // 匹配函數調用模式，使用改進的正則表達式處理嵌套
    const functionRegex = FUNCTION_REGEX;
    let match;

    while ((match = functionRegex.exec(expression)) !== null) {
        const funcName = match[1];
        const params = match[2];

        if (!functionMap.has(funcName)) {
            functionErrors.push(`Unknown function: ${funcName}`);
            continue;
        }

        const expectedParamCount = functionMap.get(funcName)!;

        if (!params || !params.trim()) {
            functionErrors.push(`Function ${funcName} requires ${expectedParamCount} parameter(s)`);
            continue;
        }

        // 解析參數
        const parsedParams = parseParameters(params);

        if (parsedParams.length !== expectedParamCount) {
            functionErrors.push(`Function ${funcName} expects ${expectedParamCount} parameter(s), but got ${parsedParams.length}`);
            continue;
        }

        // 驗證每個參數
        parsedParams.forEach((param, index) => {
            if (!isValidParameter(param)) {
                functionErrors.push(`Function ${funcName} parameter ${index + 1} is invalid: "${param}". Parameters must be numbers, indicators {xxx}, or valid function calls.`);
            }
        });
    }

    return functionErrors;
};

// 3. 使用 MathJS 驗證數學表達式語法
export const validateMathExpressionWithMathJS = (expression: string, availableFunctions: AvailableFunction[]): string[] => {
    const mathErrors: string[] = [];

    try {
        // 預處理表達式：
        // 1. 將指標 {xxx} 替換為變數 x
        // 2. 將自定義函數替換為 MathJS 認識的函數或變數
        let processedExpression = expression;

        // 替換指標為變數 x
        processedExpression = processedExpression.replace(/{[^}]+}/g, 'x');

        // 檢查是否有未完成的函數調用（只有函數名沒有括號）
        const functionNames = availableFunctions.map(func => func.label.split('(')[0]);
        if (functionNames.length > 0) {
            // 先處理函數調用，再檢查孤立的函數名稱
            // 遞歸替換函數調用為變數 f，從最內層開始
            let hasFunction = true;
            let maxIterations = 10;

            while (hasFunction && maxIterations > 0) {
                const beforeReplace = processedExpression;

                // 匹配最內層的函數調用（沒有嵌套括號的）
                const innerFunctionPattern = new RegExp(`\\b(${functionNames.join('|')})\\s*\\(([^()]*)\\)`, 'g');
                processedExpression = processedExpression.replace(innerFunctionPattern, 'f');

                hasFunction = beforeReplace !== processedExpression;
                maxIterations--;
            }

            // 在處理完所有有效的函數調用後，檢查是否還有孤立的函數名稱
            const lonelyFunctionPattern = new RegExp(`\\b(${functionNames.join('|')})(?!\\s*\\()`, 'g');
            if (lonelyFunctionPattern.test(processedExpression)) {
                mathErrors.push('Incomplete function call found. Functions must be followed by parentheses.');
                return mathErrors;
            }
        }

        // 如果處理後的表達式為空或只有變數，創建一個簡單的測試表達式
        if (!processedExpression.trim() || /^[xf\s]+$/.test(processedExpression)) {
            processedExpression = '1';
        }

        // 使用 MathJS 解析和驗證
        const node = math.parse(processedExpression);
        const compiled = node.compile();

        // 嘗試評估表達式（提供測試變數值）
        const scope = { x: 1, f: 1 };
        compiled.evaluate(scope);

    } catch (error) {
        if (error instanceof Error) {
            // 過濾掉一些不相關的 MathJS 錯誤
            const errorMessage = error.message.toLowerCase();

            // 忽略未定義變數的錯誤（因為我們的指標和函數會被替換為變數）
            if (!errorMessage.includes('undefined symbol') &&
                !errorMessage.includes('undefined function')) {
                mathErrors.push(`Invalid mathematical expression syntax: ${error.message}`);
            }
        }
    }

    return mathErrors;
};

// 驗證邏輯函數
export const validateExpression = (expr: string, availableIndicators: AvailableIndicator[],
                                   availableFunctions: AvailableFunction[]): ValidationResult => {
    const errors: string[] = [];

    // 如果表達式為空，視為有效
    if (!expr.trim()) {
        return { isValid: true, errors: [] };
    }

    // 1. 驗證大括號中的指標
    const indicatorErrors = validateIndicators(expr, availableIndicators);
    errors.push(...indicatorErrors);

    // 2. 驗證函數調用（保持原邏輯）
    const functionErrors = validateFunctions(expr, availableIndicators, availableFunctions);
    errors.push(...functionErrors);

    // 3. 使用 MathJS 驗證數學表達式語法
    const mathErrors = validateMathExpressionWithMathJS(expr, availableFunctions);
    errors.push(...mathErrors);

    return {
        isValid: errors.length === 0,
        errors
    };
};