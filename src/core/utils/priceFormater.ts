import { Decimal } from 'decimal.js';

export function formatPriceFromDigits(input: string) {
  if (!input) return '0.00';

  // Eliminar caracteres no numéricos y punto decimal
  const sanitized = input.replace(/[^\d.]/g, '');

  if (!sanitized) return '0.00';

  // ⚡️ Si ya tiene punto decimal, úsalo como número real
  if (sanitized?.includes('.')) {
    const number = parseFloat(sanitized);
    if (isNaN(number)) return '0.00';
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ⚡️ Si no tiene punto decimal, tratamos como dígitos que representan centavos
  const number = parseInt(sanitized, 10);
  const value = number / 100;

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercentageFromPrice(input: string, percentage: string) {
    const cleanInput = input.replaceAll(',', '');
    const cleanPercentage = percentage.replaceAll('+', '').replaceAll('%', '');

    if (cleanPercentage === '') return input;
    if (input === '0.00') return input;

    const inputDecimal = new Decimal(parseFloat(cleanInput));
    const percentageDecimal = new Decimal(parseInt(cleanPercentage)).dividedBy(100);
    const result = inputDecimal.plus(inputDecimal.mul(percentageDecimal));

    return formatPriceFromDigits(result.toFixed(2).toString());
}

export function calculateExtraAmount(input: string, percentage: string) {
    const cleanInput = input.replaceAll(',', '');
    const cleanPercentage = percentage.replaceAll('+', '').replaceAll('%', '');

    if (cleanPercentage === '') return '0.00';
    if (input === '0.00' || !cleanInput) return '0.00';

    const inputDecimal = new Decimal(parseFloat(cleanInput));
    const percentageDecimal = new Decimal(parseInt(cleanPercentage, 10)).dividedBy(100);
    
    // Solo calculamos la multiplicación para obtener la fracción extra
    const extraAmount = inputDecimal.mul(percentageDecimal);

    return formatPriceFromDigits(extraAmount.toFixed(2).toString());
}
