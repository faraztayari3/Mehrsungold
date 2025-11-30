import Decimal from 'decimal.js';

// Use check if number1 is divisible by number2
const IsDivisible = (number1, number2) => {
    const decimal1 = new Decimal(number1);
    const decimal2 = new Decimal(number2);
    return decimal1.mod(decimal2).isZero();
}

export default IsDivisible;