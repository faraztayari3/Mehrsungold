import LinkRouter from 'next/link'
import React from 'react'
import { useTranslations } from 'next-intl'
import Button from '@mui/material/Button'

const NotFound = () => {

    const langText = useTranslations('');

    return (
        <div className="px-4">
            <div className="flex flex-col items-center justify-center h-screen gap-y-8 dark:text-white">
                <img src="/assets/img/general/404.png" alt="404" width={'100%'} height={'100%'} className="w-full md:w-[550px] h-[30%]" />
                <p className="text-xl text-center font-semibold">{langText('Not_found.Message')}</p>
                <LinkRouter legacyBehavior href="/"><Button type="button" variant="contained" size="medium" className="rounded-lg"><text className="text-black font-semibold">{langText('Not_found.BackToHome')}</text></Button></LinkRouter>
            </div>
        </div>
    )

}

export default NotFound