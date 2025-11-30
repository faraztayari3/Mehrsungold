/**
     * Function to handle time label .
     * @returns {Function} - An event handler function that performs the transfer.
     */
const TimeSince = (date, langText) => {
    date = new Date(date)
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + ' ' + langText('SinceDates.Year');
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + ' ' + langText('SinceDates.Month');
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + ' ' + langText('SinceDates.Day');
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + ' ' + langText('SinceDates.Hour');
    }
    interval = seconds / 60;

    if (interval > 1) {
        return Math.floor(interval) + ' ' + langText('SinceDates.Minute');
    }
    return langText('SinceDates.Now');
}

export default TimeSince;