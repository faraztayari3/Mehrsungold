import moment from 'jalali-moment';

/**
 * convert isodate to Jalali text format based on the given date.
 * @param {number} text - The text to convert.
 * @returns {string} - The converted text.
 */
const ConvertToJalali = (dateTime) => {

    const jalaliDateTime = moment(dateTime).locale('fa').format('YYYY/MM/DD HH:mm');

    const [date, time] = jalaliDateTime.split(' ');
    const [hours, minutes] = time.split(':');

    let period = 'قبل از ظهر';
    let hour = parseInt(hours, 10);

    if (hour >= 12) {
        period = 'بعد از ظهر';
        if (hour > 12) {
            hour -= 12;
        }
    }

    if (hour === 0) {
        hour = 12;
    }

    const formattedTime = `${String(hour).padStart(2, '0')}:${minutes} ${period}`;
    return formattedTime;
}

export default ConvertToJalali;