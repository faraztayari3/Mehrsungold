/**
     * Determines the bank name and image based on the given card number.
     * @param {{string}} number - The card number to check.
     * @returns An object containing the bank name and image.
     */
const CheckCardNumber = (number) => {

    function validateCard(code) {
        var L = code?.length || 0;
        if (L < 16 || parseInt(code.substr(1, 10), 10) == 0 || parseInt(code.substr(10, 6), 10) == 0) return false;
        var c = parseInt(code.substr(15, 1), 10);
        var s = 0;
        var k, d;
        for (var i = 0; i < 16; i++) {
            k = (i % 2 == 0) ? 2 : 1;
            d = parseInt(code.substr(i, 1), 10) * k;
            s += (d > 9) ? d - 9 : d;
        }
        return ((s % 10) == 0);
    }
    validateCard(number);
    var cardNumber = number?.substring(6, -16) || '';
    if (cardNumber === '603799') { return { name: `کارت بانک ملی`, image: "/assets/img/bank-iran/meli.png" } }
    else if (cardNumber === '589210') { return { name: `کارت بانک سپه`, image: "/assets/img/bank-iran/sepah.png" } }
    else if (cardNumber === '627961') { return { name: `کارت بانک صنعت و معدن`, image: "/assets/img/bank-iran/sanatmadan.png" } }
    else if (cardNumber === '603770') { return { name: `کارت بانک کشاورزی`, image: "/assets/img/bank-iran/keshavarsi.png" } }
    else if (cardNumber === '628023') { return { name: `کارت بانک مسکن`, image: "/assets/img/bank-iran/maskan.png" } }
    else if (cardNumber === '627760') { return { name: `کارت بانک پست بانک`, image: "/assets/img/bank-iran/postbank.png" } }
    else if (cardNumber === '502908') { return { name: `کارت بانک توسعه`, image: "/assets/img/bank-iran/tosehe.png" } }
    else if (cardNumber === '627412') { return { name: `کارت بانک اقتصاد نوین`, image: "/assets/img/bank-iran/eghtesad.png" } }
    else if (cardNumber === '622106') { return { name: `کارت بانک پارسیان`, image: "/assets/img/bank-iran/parsian.png" } }
    else if (cardNumber === '502229') { return { name: `کارت بانک پاسارگاد`, image: "/assets/img/bank-iran/pasargad.png" } }
    else if (cardNumber === '627488') { return { name: `کارت بانک کارآفرین`, image: "/assets/img/bank-iran/karafarin.png" } }
    else if (cardNumber === '621986') { return { name: `کارت بانک سامان`, image: "/assets/img/bank-iran/saman.png" } }
    else if (cardNumber === '639346') { return { name: `کارت بانک سینا`, image: "/assets/img/bank-iran/sina.png" } }
    else if (cardNumber === '639607') { return { name: `کارت بانک سرمایه`, image: "/assets/img/bank-iran/sarmaye.png" } }
    else if (cardNumber === '502806') { return { name: `کارت بانک شهر`, image: "/assets/img/bank-iran/shahr.png" } }
    else if (cardNumber === '502938') { return { name: `کارت بانک دی`, image: "/assets/img/bank-iran/day.png" } }
    else if (cardNumber === '603769') { return { name: `کارت بانک صادرات`, image: "/assets/img/bank-iran/saderat.png" } }
    else if (cardNumber === '610433') { return { name: `کارت بانک ملت`, image: "/assets/img/bank-iran/mellat.png" } }
    else if (cardNumber === '627353' || cardNumber === '585983') { return { name: `کارت بانک تجارت`, image: "/assets/img/bank-iran/tejarat.png" } }
    else if (cardNumber === '589463') { return { name: `کارت بانک رفاه`, image: "/assets/img/bank-iran/refah.png" } }
    else if (cardNumber === '627381') { return { name: `کارت بانک انصار`, image: "/assets/img/bank-iran/ansar.png" } }
    else if (cardNumber === '639370') { return { name: `کارت بانک مهر اقتصاد`, image: "/assets/img/bank-iran/mehreqtesad.png" } }
    else if (cardNumber === '639599') { return { name: `کارت بانک قوامین`, image: "/assets/img/bank-iran/ghavamin.png" } }
    else if (cardNumber === '504172') { return { name: `کارت بانک رسالت`, image: "/assets/img/bank-iran/resalat.png" } }
    else { return { name: ` بانک نامشخص`, image: "/assets/img/bank-iran/global.png" } }
}

export default CheckCardNumber;