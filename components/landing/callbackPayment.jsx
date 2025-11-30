import { useEffect } from 'react'
import LinkRouter from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import Button from '@mui/material/Button'

const CallbackPayment = () => {

    const langText = useTranslations('');
    const { locale } = useRouter();
    const router = useRouter();

    const handlePaymentRedirect = () => {
        const isLocalhost = window.location.hostname === "localhost";
        const mobileAppLink = isLocalhost ? `${window.location?.origin}/panel/history`
            : `${window.location?.origin?.replace('https://', '')}://panel/history`;
        const webLink = `${window.location?.origin}/panel/history`;

        window.location.href = mobileAppLink;

        setTimeout(() => {
            router.push(webLink, webLink, { locale });
        }, 1000);
    };

    return (
        <div className="px-4">
            <div className="flex flex-col items-center justify-center h-screen  dark:text-white">
                <img src={`/assets/img/general/${router.query.status == 'Accepted' ? 'confirmPayment.png' : 'rejectPayment.png'}`} alt="paymentStatus"
                    width={'100%'} height={'100%'} className="w-[60%] md:w-[300px] h-[200px] md:h-[300px] rounded-[50%]" />
                <p className="text-3xl font-semibold pt-10 lg:text-5xl">{router.query.status == 'Accepted' ? langText('Payment.MessageSuccess') : langText('Payment.MessageRejected')}</p>
                <p className="text-xl lg:text-sm">{router.query.status == 'Accepted' ? langText('Payment.SubMessageSuccess') : langText('Payment.SubMessageRejected')}</p>
                {router.query.status == 'Accepted' ? <h1>{router.query.trackingCode}</h1> : null}
                <Button type="button" variant="contained" size="medium" className="rounded-lg" onClick={handlePaymentRedirect}><text className="text-black font-semibold">بازگشت به تاریخچه</text></Button>
            </div>
        </div>
    )

}

export default CallbackPayment