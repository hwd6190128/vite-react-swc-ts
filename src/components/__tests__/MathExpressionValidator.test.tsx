import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MathExpressionValidator, { validateMathExpression } from '../MathExpressionValidator';

describe('MathExpressionValidator', () => {
  it('應該正確渲染元件', () => {
    render(<MathExpressionValidator />);
    
    expect(screen.getByText('數學運算式驗證器')).toBeInTheDocument();
    expect(screen.getByLabelText('輸入數學運算式:')).toBeInTheDocument();
    expect(screen.getByText('客製化運算式列表 A:')).toBeInTheDocument();
    expect(screen.getByText('已知運算式列表 B:')).toBeInTheDocument();
  });

  it('應該顯示客製化運算式列表', () => {
    render(<MathExpressionValidator />);
    
    expect(screen.getByText('{SUM}')).toBeInTheDocument();
    expect(screen.getByText('{AVERAGE}')).toBeInTheDocument();
    expect(screen.getByText('{MAX}')).toBeInTheDocument();
    expect(screen.getByText('{MIN}')).toBeInTheDocument();
    expect(screen.getByText('{COUNT}')).toBeInTheDocument();
    expect(screen.getByText('{PRODUCT}')).toBeInTheDocument();
  });

  it('應該顯示已知運算式列表', () => {
    render(<MathExpressionValidator />);
    
    expect(screen.getByText('ABS(參數數量: 1)')).toBeInTheDocument();
    expect(screen.getByText('POW(參數數量: 2)')).toBeInTheDocument();
    expect(screen.getByText('SQRT(參數數量: 1)')).toBeInTheDocument();
  });

  it('空輸入應該顯示為有效', () => {
    render(<MathExpressionValidator />);
    
    const input = screen.getByLabelText('輸入數學運算式:');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(screen.queryByText('✓ 運算式有效')).toBeInTheDocument();
    expect(screen.queryByText('✗ 運算式無效')).not.toBeInTheDocument();
  });
});

describe('validateMathExpression', () => {
  describe('基本數學運算式驗證', () => {
    it('應該驗證有效的簡單數學運算式', () => {
      const result = validateMathExpression('1 + 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該驗證複雜的數學運算式', () => {
      const result = validateMathExpression('(1 + 2) * 3 / 4');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該驗證包含小數的運算式', () => {
      const result = validateMathExpression('1.5 + 2.3 * 0.5');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該拒絕無效的數學符號', () => {
      const result = validateMathExpression('1 + 2 @ 3');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('包含無效的數學運算式符號');
    });

    it('應該拒絕不完整的運算符', () => {
      const result = validateMathExpression('1 + 2 +');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('運算式結尾有未完成的運算符');
    });

    it('應該拒絕不匹配的括號', () => {
      const result = validateMathExpression('(1 + 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('括號數量不匹配');
    });
  });

  describe('客製化運算式驗證 (列表A)', () => {
    it('應該驗證有效的客製化運算式', () => {
      const result = validateMathExpression('1 + {SUM} * 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該驗證多個客製化運算式', () => {
      const result = validateMathExpression('{SUM} + {AVERAGE} * {MAX}');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該拒絕無效的客製化運算式', () => {
      const result = validateMathExpression('1 + {INVALID} * 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('大括號內容 "INVALID" 不是有效的客製化運算式');
    });

    it('應該拒絕部分有效的客製化運算式', () => {
      const result = validateMathExpression('{SUM} + {INVALID} + {MAX}');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('大括號內容 "INVALID" 不是有效的客製化運算式');
    });

    it('應該處理空的大括號內容', () => {
      const result = validateMathExpression('1 + {} * 2');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('大括號內容 "" 不是有效的客製化運算式');
    });
  });

  describe('已知運算式驗證 (列表B)', () => {
    it('應該驗證有效的 ABS 函數', () => {
      const result = validateMathExpression('ABS(x)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該驗證有效的 POW 函數', () => {
      const result = validateMathExpression('POW(x,y)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該驗證有效的 SQRT 函數', () => {
      const result = validateMathExpression('SQRT(16)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該拒絕無效的 ABS 函數 (缺少參數)', () => {
      const result = validateMathExpression('ABS()');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ABS 函數參數數量或格式不正確');
    });

    it('應該拒絕無效的 POW 函數 (缺少第二個參數)', () => {
      const result = validateMathExpression('POW(x,)');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('POW 函數參數數量或格式不正確');
    });

    it('應該拒絕無效的 POW 函數 (只有一個參數)', () => {
      const result = validateMathExpression('POW(x)');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('POW 函數參數數量或格式不正確');
    });

    it('應該拒絕無效的 POW 函數 (多餘的參數)', () => {
      const result = validateMathExpression('POW(x,y,z)');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('POW 函數參數數量或格式不正確');
    });
  });

  describe('混合運算式驗證', () => {
    it('應該驗證包含所有類型的有效運算式', () => {
      const result = validateMathExpression('1 + {SUM} * ABS(x) / POW(y,z)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該驗證複雜的混合運算式', () => {
      const result = validateMathExpression('({SUM} + {AVERAGE}) * ABS(x) / POW(y,z) + SQRT(16)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該拒絕包含多種錯誤的運算式', () => {
      const result = validateMathExpression('1 + {INVALID} * ABS() / POW(x,) +');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('大括號內容 "INVALID" 不是有效的客製化運算式');
      expect(result.errors).toContain('ABS 函數參數數量或格式不正確');
      expect(result.errors).toContain('POW 函數參數數量或格式不正確');
      expect(result.errors).toContain('運算式結尾有未完成的運算符');
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理只有數字的運算式', () => {
      const result = validateMathExpression('123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該處理只有運算符的運算式', () => {
      const result = validateMathExpression('+');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('運算式結尾有未完成的運算符');
    });

    it('應該處理只有大括號的運算式', () => {
      const result = validateMathExpression('{SUM}');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該處理只有函數的運算式', () => {
      const result = validateMathExpression('ABS(x)');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該處理包含空格的運算式', () => {
      const result = validateMathExpression('1 + 2 * 3');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('應該處理包含多個空格的運算式', () => {
      const result = validateMathExpression('1   +   2   *   3');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
}); 