import { describe, it, expect } from 'vitest';
import { validateMathExpression } from '../MathExpressionValidator';

describe('validateMathExpression', () => {
  describe('Basic mathematical expression validation', () => {
    it('should validate valid simple mathematical expressions', () => {
      const result = validateMathExpression('1 + 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate complex mathematical expressions', () => {
      const result = validateMathExpression('(1 + 2) * 3 / 4');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate expressions with decimals', () => {
      const result = validateMathExpression('1.5 + 2.3 * 0.5');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid mathematical symbols', () => {
      const result = validateMathExpression('1 + 2 @ 3');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Contains invalid characters: @');
    });

    it('should reject incomplete operators', () => {
      const result = validateMathExpression('1 + 2 +');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expression cannot end with an operator');
    });

    it('should reject unmatched parentheses', () => {
      const result = validateMathExpression('(1 + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing 1 right parentheses');
    });

    it('should reject empty parentheses', () => {
      const result = validateMathExpression('1 + () + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot have empty parentheses');
    });

    it('should reject operators directly followed by right parentheses', () => {
      const result = validateMathExpression('1 + (2 +)');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Operator cannot be directly followed by right parenthesis');
    });

    it('should reject left parentheses directly followed by operators', () => {
      const result = validateMathExpression('1 + (+ 2)');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Left parenthesis cannot be directly followed by "+"');
    });

    it('should reject multiple decimal points', () => {
      const result = validateMathExpression('1.5.2 + 3');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid number format: multiple decimal points');
    });

    it('should reject consecutive dots', () => {
      const result = validateMathExpression('1..5 + 3');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot have consecutive dots');
    });

    it('should allow negative sign at the beginning', () => {
      const result = validateMathExpression('-1 + 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow positive and negative sign combinations', () => {
      const result = validateMathExpression('1 + -2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject other consecutive operator combinations', () => {
      const result = validateMathExpression('1 ++ 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot have consecutive operators');
    });

    it('should reject expressions starting with "*"', () => {
      const result = validateMathExpression('* 1 + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expression cannot start with "*" or "/"');
    });

    it('should reject expressions starting with "/"', () => {
      const result = validateMathExpression('/ 1 + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expression cannot start with "*" or "/"');
    });

    it('should reject expressions starting with "+"', () => {
      const result = validateMathExpression('+ 1 + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expression cannot start with "+"');
    });

    it('should reject decimal points directly followed by operators', () => {
      const result = validateMathExpression('1. + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid decimal point position');
    });

    it('should allow operators directly followed by decimal points', () => {
      const result = validateMathExpression('1 + .5');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject consecutive plus signs', () => {
      const result = validateMathExpression('1 ++ 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot have consecutive operators');
    });

    it('should reject consecutive multiplication signs', () => {
      const result = validateMathExpression('1 ** 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot have consecutive operators');
    });

    it('should reject consecutive division signs', () => {
      const result = validateMathExpression('1 // 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot have consecutive operators');
    });

    it('should reject spaces between operators', () => {
      const result = validateMathExpression('1 + + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid operator combination');
    });
  });

  describe('Custom expression validation (List A)', () => {
    it('should validate valid custom expressions', () => {
      const result = validateMathExpression('1 + {SUM} * 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate multiple custom expressions', () => {
      const result = validateMathExpression('{SUM} + {AVERAGE} * {MAX}');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid custom expressions', () => {
      const result = validateMathExpression('1 + {INVALID} * 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown custom expression: {INVALID}');
    });

    it('should reject partially valid custom expressions', () => {
      const result = validateMathExpression('{SUM} + {INVALID} + {MAX}');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown custom expression: {INVALID}');
    });

    it('should handle empty brace content', () => {
      const result = validateMathExpression('1 + {} * 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Braces cannot be empty');
    });

    it('should check brace pairing', () => {
      const result = validateMathExpression('1 + {SUM + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unmatched braces (open: 1, close: 0)');
    });

    it('should check multiple brace pairings', () => {
      const result = validateMathExpression('1 + {SUM} + {AVERAGE} + 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should check nested braces', () => {
      const result = validateMathExpression('1 + {SUM} + {AVERAGE} + {MAX}');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should check spaces within braces', () => {
      const result = validateMathExpression('1 + { SUM } + 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Known expression validation (List B)', () => {
    it('should validate valid ABS function', () => {
      const result = validateMathExpression('ABS(x)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid POW function', () => {
      const result = validateMathExpression('POW(x,y)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid SQRT function', () => {
      const result = validateMathExpression('SQRT(16)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid LOG function', () => {
      const result = validateMathExpression('LOG(10)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid SIN function', () => {
      const result = validateMathExpression('SIN(3.14)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid COS function', () => {
      const result = validateMathExpression('COS(3.14)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid TAN function', () => {
      const result = validateMathExpression('TAN(3.14)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid MAX_FUNC function', () => {
      const result = validateMathExpression('MAX_FUNC(1,2,3)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid MIN_FUNC function', () => {
      const result = validateMathExpression('MIN_FUNC(1,2,3)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unauthorized functions', () => {
      const result = validateMathExpression('UNKNOWN_FUNC(x)');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unauthorized function: UNKNOWN_FUNC() - only predefined functions allowed');
    });

    it('should validate function parameter count', () => {
      const result = validateMathExpression('ABS()');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ABS() insufficient parameters: requires at least 1, provided 0');
    });

    it('should validate function parameter count upper limit', () => {
      const result = validateMathExpression('POW(1,2,3)');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('POW() too many parameters: maximum 2, provided 3');
    });

    it('should validate nested functions', () => {
      const result = validateMathExpression('ABS(POW(2,3))');
      console.log('ABS(POW(2,3)) result:', result);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate complex function combinations', () => {
      const result = validateMathExpression('MAX_FUNC(ABS(-5), POW(2,3), SQRT(16))');
      console.log('MAX_FUNC(ABS(-5), POW(2,3), SQRT(16)) result:', result);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Mixed expression validation', () => {
    it('should validate complex expressions containing all elements', () => {
      const result = validateMathExpression('{SUM} + ABS(-5) * POW(2,3) / {AVERAGE}');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate expressions with variables', () => {
      const result = validateMathExpression('x + y * z');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate expressions with underscore variables', () => {
      const result = validateMathExpression('user_name + age_value');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate function parameters with commas', () => {
      const result = validateMathExpression('MAX_FUNC(1, 2, 3)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty strings', () => {
      const result = validateMathExpression('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle strings with only spaces', () => {
      const result = validateMathExpression('   ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle single numbers', () => {
      const result = validateMathExpression('42');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle single variables', () => {
      const result = validateMathExpression('x');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle single function calls', () => {
      const result = validateMathExpression('ABS(5)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle single custom expressions', () => {
      const result = validateMathExpression('{SUM}');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Custom parameter testing', () => {
    it('should support custom custom expressions', () => {
      const customExpressions = new Set(['CUSTOM1', 'CUSTOM2']);
      const result = validateMathExpression('1 + {CUSTOM1} * {CUSTOM2}', customExpressions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should support custom functions', () => {
      const customFunctions = new Map([
        ['CUSTOM_FUNC', { minArgs: 1, maxArgs: 3 }]
      ]);
      const result = validateMathExpression('CUSTOM_FUNC(x,y)', undefined, customFunctions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unauthorized custom functions', () => {
      const customFunctions = new Map([
        ['AUTHORIZED_FUNC', { minArgs: 1, maxArgs: 1 }]
      ]);
      const result = validateMathExpression('UNAUTHORIZED_FUNC(x)', undefined, customFunctions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unauthorized function: UNAUTHORIZED_FUNC() - only predefined functions allowed');
    });
  });
}); 