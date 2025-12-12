import { useEffect, useState } from "react";
import Image from 'next/image';
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
        // Apply dark mode class and persist preference without re-dispatching
        if (darkModeToggle) {
            localStorage.setItem('dark', true);
            document.querySelector("html")?.classList.add("dark");
        } else {
            localStorage.setItem('dark', false);
            document.querySelector("html")?.classList.remove("dark");
        }
    }, [darkModeToggle]);

    // Fix mobile viewport height issues (address bar hiding) by setting --vh on mount
    useEffect(() => {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        setVh();
        window.addEventListener('resize', setVh);
        return () => window.removeEventListener('resize', setVh);
    }, []);

    return (
        <>
            <main
                dir="rtl"
                style={{
                    backgroundColor: '#085e5c',
                    minHeight: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    padding: 0,
                    margin: 0
                }}
            >
                <div
                    style={{
                        minHeight: 'calc(var(--vh, 1vh) * 100)',
                        width: '100%',
                        maxWidth: '30rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#085e5c',
                        padding: '1.25rem 1rem',
                        gap: '1.25rem',
                        boxSizing: 'border-box',
                        margin: '0 auto'
                    }}
                >
                    {/* فقط لوگوی متنی نمایش داده میشه */}
                    {siteInfo && (siteInfo.darkLogoImage || siteInfo.lightLogoImage) && (
                        <div className="flex flex-col items-center gap-y-4" style={{ pointerEvents: 'none' }}>
                            <img
                                crossOrigin="anonymous"
                                src={`${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.darkLogoImage || siteInfo?.lightLogoImage}`}
                                alt="logo"
                                style={{ width: '9rem', height: '9rem', display: 'block' }}
                            />
                        </div>
                    )}

                    {children}
                </div>
            </main>

            <CustomSnackbar open={snackbarProps?.open || false} content={snackbarProps?.content || ''} type={snackbarProps?.type || 'success'} duration={snackbarProps?.duration || 1000} refresh={snackbarProps?.refresh || 1} />
        </>
    )
}

export default AuthPageLayout;


