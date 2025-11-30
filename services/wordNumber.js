/**
 * Turn Numbers into words based on the given number .
 * @param {number} num - The number to initialize the floor number.
 * @returns {string} - The formatted word string number.
 */
const WordNumber = (num) => {


    const units = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];
    const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
    const teens = ['', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
    const tens = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];

    const numberWordsMap = {
        0: '',
        1: 'یک',
        2: 'دویست',
        3: 'سی',
        4: 'چهار',
        5: 'پان',
        6: 'شش',
        7: 'هفت',
        8: 'هشت',
        9: 'نه'
    };

    function convertThreeDigits(num) {
        if (num === 0) return '';
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        const digit = num % 10;
        const ten = Math.floor(num / 10) % 10;
        const hundred = Math.floor(num / 100);
        let result = '';
        if (hundred > 0) {
            result += numberWordsMap[hundred] + 'صد';
        }
        if (ten > 0 || digit > 0) {
            if (result !== '') result += ' و ';
            if (ten === 1) {
                result += teens[num - 10];
            } else {
                if (ten > 0) {
                    result += tens[ten];
                }
                if (digit > 0) {
                    if (ten > 0) {
                        result += ' و ';
                    }
                    result += ones[digit];
                }
            }
        }
        return result;
    }


    const numString = num.toString();
    const numLength = numString.length;
    let result = '';
    for (let i = 0; i < numLength; i += 3) {
        const chunk = parseInt(numString.slice(-i - 3, numLength - i), 10);
        const chunkWords = convertThreeDigits(chunk);
        if (chunkWords !== '') {
            if (result !== '') {
                result = chunkWords + ' ' + units[Math.floor(i / 3)] + ' و ' + result;
            } else {
                result = chunkWords + ' ' + units[Math.floor(i / 3)];
            }
        }
    }
    return result === '' ? 'صفر' : result;
}

export default WordNumber;