import React, { useState} from 'react';
import './MathExpressionValidator.css';
import useMathValidator from "./useMathValidator.tsx";

// ==================== Main Component ====================
const availableIndicators = [
    {indicator: '1_xex_56ind'},
    {indicator: '2_xe3_56ind'},
    {indicator: '3_xef_56ind'},
    {indicator: '4_xea_56ind'},
    {indicator: '5_as_ind'},
    {indicator: '6_xdf_56d'},
    {indicator: '7_sdo_5bind'},
    {indicator: '8_aeo_5'},
    {indicator: 'aa_xeo_675'},
]
const availableFunctions = [
    {label: 'Abs(X)', value: 'Abs()'},
    {label: 'Hypot(X,Y)', value: 'Hypot(,)'},
    {label: 'Max(X,Y)', value: 'Max(,)'},
    {label: 'Min(X,Y)', value: 'Min(,)'},
    {label: 'Power(Base,Exponent)', value: 'Power(,)'},
    {label: 'Round(X)', value: 'Round()'},
    {label: 'RoundTo(X,ADigit)', value: 'RoundTo(,)'},
    {label: 'Sqr(X)', value: 'Sqr()'},
    {label: 'Sqrt(X)', value: 'Sqrt()'},
];

interface MathExpressionValidatorProps {
    className?: string;
}

export const MathExpressionValidator: React.FC<MathExpressionValidatorProps> = ({
                                                                                    className = ''
                                                                                }) => {
    const [expression, setExpression] = useState('');
    const {isValid, errors} = useMathValidator({expression, availableIndicators, availableFunctions});

    const handleExpressionChange = (value: string) => {
        setExpression(value);
    };

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
                    placeholder="e.g., 1 + {SUM} * Abs(x) / 2"
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
        </div>
    );
};

export default MathExpressionValidator;
