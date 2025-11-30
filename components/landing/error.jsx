import LinkRouter from 'next/link'
import React from 'react'
import { useTranslations } from 'next-intl'
import Button from '@mui/material/Button'

const CustomError = () => {

    const langText = useTranslations('');

    return (
        <div className="px-4">
            <div className="flex flex-col items-center justify-center h-screen gap-y-8 dark:text-white">
                <img src={`/assets/img/general/rejectPayment.png`} alt="500"
                    width={'100%'} height={'100%'} className="w-[60%] md:w-[300px] h-[200px] md:h-[300px] rounded-[50%]" />
                <h1 className="text-5xl !font-sans">500</h1>
                <h3>{langText('Error.Message')}</h3>
                <LinkRouter legacyBehavior href="/"><Button type="button" variant="contained" size="medium" className="rounded-lg"><text className="text-black font-semibold">{langText('Error.BackToHome')}</text></Button></LinkRouter>
            </div>
        </div>
    )

}

export default CustomError