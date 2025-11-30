/**
 * convert farsi number to english based on the given text.
 * @param {number} text - The text to convert.
 * @returns {string} - The converted text.
 */
var
    persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],
    arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

const convertPersianToEnglish = (text) => {

    if (!text || typeof text !== 'string') return '';
    for (let i = 0; i < 10; i++) {
        text = text.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
    }
    return text;
}

export default convertPersianToEnglish;