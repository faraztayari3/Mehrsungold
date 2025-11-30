import { NextResponse } from 'next/server';

export async function middleware(req) {

    const { origin } = req.nextUrl;
    const userCookie = req.cookies.get('userToken')?.value;
    const adminCookie = req.cookies.get('adminToken')?.value;
    const language = req.cookies.get('language')?.value || (process.env.NEXT_PUBLIC_DEFAULTLOCALE || 'fa');

    if (req.url.includes(`/panel`) && !req.url.includes(`/admin/panel`) && process.env.NEXT_PUBLIC_CUSTOMER_DOMAIN == 'true') {
        return NextResponse.redirect(new URL(`${origin}/${language}/admin/panel`, req.url));
    } else {
        if (req.url.includes('/admin/panel') && !adminCookie) {
            return NextResponse.redirect(new URL(`${origin}/${language}/admin/auth`, req.url));
        }
        if (req.url.includes('/admin/panel') && adminCookie) {
            return NextResponse.next();
        }

        if (req.url.includes(`/panel`) && !req.url.includes(`/admin/panel`) && !userCookie) {
            return NextResponse.redirect(new URL(`${origin}/${language}/auth`, req.url));
        }
        if (req.url.includes(`/panel`) && !req.url.includes(`/admin/panel`) && userCookie) {
            return NextResponse.next();
        }

        if ((req.url.includes(`/auth`)) && !req.url.includes(`/admin/auth`) && userCookie) {
            return NextResponse.redirect(new URL(`${origin}/${language}/panel`, req.url));
        }
    }

    // If user is authenticated, continue.
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
}