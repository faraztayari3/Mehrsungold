import { useEffect, useState } from "react";
import LinkRouter from 'next/link';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

// CustomSnackbar
import CustomSnackbar from '../shared/snackbar';

// Context
import { useAppContext } from "../../context/AppContext";

const AuthPageLayout = ({ children }) => {

    const { state, dispatch } = useAppContext();
    const { siteInfo, darkModeToggle, snackbarProps } = state;

    useEffect(() => {
        if (darkModeToggle) {
            localStorage.setItem('dark', true);
            document.querySelector("html").classList.add("dark");
            dispatch({ type: "setDarkModeToggle", value: true });
        } else {
            localStorage.setItem('dark', false);
            document.querySelector("html").classList.remove("dark");
            dispatch({ type: "setDarkModeToggle", value: false });
        }
    }, [darkModeToggle]);

    return (
        <>
            <main dir="rtl">
                <div className="w-screen h-screen relative">
                    <div className="flex flex-col lg:grid grid-cols-12 lg:items-center relative h-full">
                        <div className="auth-banner-section relative col-span-12 lg:col-span-6 xl:col-span-4 bg-light-secondary-foreground dark:bg-dark-secondary h-fit lg:h-full lg:flex flex-col items-center justify-center">
                            <div className="h-full flex flex-col items-center justify-center gap-y-16 mx-7">
                                <div className="flex flex-col items-center gap-y-16 lg:py-8">
                                    <LinkRouter legacyBehavior href="/">
                                        <Link href="/" className="text-large-1 lg:text-large-3 flex lg:flex-col items-center gap-x-4 gap-y-4 my-2 lg:my-0">
                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${darkModeToggle ? siteInfo?.darkIconImage : siteInfo?.lightIconImage}`} alt="icon" className="svgr lg:w-[8rem] h-14 lg:h-[8rem] text-black dark:text-white" />
                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${darkModeToggle ? siteInfo?.darkLogoImage : siteInfo?.lightLogoImage}`} className="svgr lg:w-[7rem] h-10 lg:h-[5rem] text-black dark:text-white" />
                                        </Link>
                                    </LinkRouter>
                                    <span className="hidden lg:block text-center" >با هر مبلغی بدون پرداخت اجرت و مالیات، فلزات گرانبها <br />بخرید و بفروشید و در هر زمان تحویل بگیرید.</span>
                                </div>
                                <img src="/assets/img/svg/auth-svg.svg" alt="auth-svg" className="h-80 hidden lg:block absolute bottom-0 right-[80%] w-52" />
                            </div>
                        </div>
                        <div id="auth-scroll" className="col-span-12 lg:col-span-6 xl:col-span-8 h-full flex items-center justify-center dark:bg-dark-alt">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <CustomSnackbar open={snackbarProps?.open || false} content={snackbarProps?.content || ''} type={snackbarProps?.type || 'success'} duration={snackbarProps?.duration || 1000} refresh={snackbarProps?.refresh || 1} />
        </>
    )
}

export default AuthPageLayout;