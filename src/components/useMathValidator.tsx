import { useEffect, useMemo, useState} from "react";
import { debounce } from "lodash-es";
import {validateExpression} from "./MathValidationUtils.ts";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface AvailableIndicator {
    indicator: string;
}

export interface AvailableFunction {
    label: string;
    value: string;
}

interface UseMathValidatorProps {
    expression?: string;
    availableIndicators?: AvailableIndicator[];
    availableFunctions?: AvailableFunction[];
}

const useMathValidator = ({
                              expression = '',
                              availableIndicators = [],
                              availableFunctions = [],
                          }: UseMathValidatorProps): ValidationResult => {

    const [validationResult, setValidationResult] = useState<ValidationResult>({
        isValid: true,
        errors: []
    });

    // 2. 使用 useMemo 來創建 debounced 函式
    // 它的依賴是 memoizedValidateExpression，同樣也是穩定的。
    // 這確保了 debounce 實例在 re-render 之間是同一個，使其能夠正常運作。
    const debouncedValidate = useMemo(() =>
            debounce((expr: string) => {
                const result = validateExpression(expr, availableIndicators, availableFunctions);
                setValidationResult(result);
            }, 300),
        [availableFunctions, availableIndicators]
    );

    // 3. useEffect 處理副作用
    // 它的依賴 debouncedValidate 也是穩定的，只會在 expression 改變時觸發。
    useEffect(() => {
        debouncedValidate(expression);

        return () => {
            debouncedValidate.cancel();
        };
    }, [expression, debouncedValidate]);

    return validationResult;
};

export default useMathValidator;