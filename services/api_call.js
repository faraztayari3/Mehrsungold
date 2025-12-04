
import { parseCookies, setCookie } from "nookies"

/**
 * Makes an API call to the specified URL using the given method, locale, body, query, token, router, and formData.
 * @param {string} url - The URL to make the API call to.
 * @param {string} method - The HTTP method to use for the API call (GET, POST, PUT, DELETE).
 * @param {string} locale - The locale to use for the API call.
 * @param {object} body - The request body for the API call.
 * @param {string} query - The query parameters for the API call.
 * @param {string} token - The token to use for authorization.
 * @param {object} router - The router object for navigation.
 *
 */
const ApiCall = (url, method, locale, body, query, token, router, formData) => {
    const cookies = parseCookies();

    const langToken = locale || (process.env.NEXT_PUBLIC_DEFAULTLOCALE || 'fa');

    let response;
    console.log(token);
    let authToken = token === 'user' ? cookies.userToken : cookies.adminToken;

    let result = new Promise(async (resolve, reject) => {
        // Check if URL is absolute (starts with http:// or https://)
        const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
        const finalUrl = isAbsoluteUrl ? url : `${process.env.NEXT_PUBLIC_BASEURL}${url}`;
        
        if (method == 'GET' || method == 'DELETE') {
            response = await fetch(`${finalUrl}?${query ? `${query}` : ''}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            }).then(async (response) => {
                const result = typeof response == 'object' ? await response.json() : response;
                console.log(response, result);
                if (response.status < 300) {
                    console.log('resloved');
                    resolve(result);
                } else if (response.status == 401) {
                    if (token === 'user') {
                        setCookie(null, 'userToken', "", { path: '/' });
                        return router.push('/auth', '/auth', { locale: langToken });
                    } else {
                        setCookie(null, 'adminToken', "", { path: '/' });
                        return router.push('/admin/auth', '/admin/auth', { locale: langToken });
                    }
                } else {
                    reject(result);
                }
            }).catch(async (error) => {
                console.log(error);
                reject(error);
            });
        } else if (method == 'POST' || method == 'PATCH' || method == 'PUT') {
            let customBody = formData ? body : JSON.stringify(body);
            let customHeaders = formData ? { 'Authorization': `Bearer ${authToken}` } : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };
            response = await fetch(`${finalUrl}?${query ? `${query}` : ''}`, {
                method,
                headers: customHeaders,
                body: customBody
            }).then(async (response) => {
                // const hasContent = response.headers.get('Content-Length') && response.headers.get('Content-Length') !== '0';
                const result = typeof response == 'object' ? await response.json() : response;
                console.log(5555, response, result);
                if (response.status < 300) {
                    resolve(result);
                } else if (response.status == 401) {
                    if (token === 'user') {
                        setCookie(null, 'userToken', "", { path: '/' });
                        return router.push('/auth', '/auth', { locale: langToken });
                    } else {
                        setCookie(null, 'adminToken', "", { path: '/' });
                        return router.push('/admin/auth', '/admin/auth', { locale: langToken });
                    }
                } else {
                    reject(result);
                }
            }).catch(async (error) => {
                console.log(111, error);
                reject(error);
            });
        }
    });

    return result;
}

export default ApiCall;