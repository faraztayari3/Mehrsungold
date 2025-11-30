import { createContext, useContext, useMemo, useReducer, useEffect } from "react";
import { AppReducer, initialState } from "./AppReducer";
import { parseCookies } from "nookies";

const AppContext = createContext();

/**
 * A wrapper component that provides the application context and manages the state using a reducer.
 * @param {Object} children - The child components to be wrapped by the AppWrapper.
 * @returns The wrapped child components with the application context provided.
 */
export const AppWrapper = ({ children }) => {

    const [state, dispatch] = useReducer(AppReducer, initialState);
    const [noRefresh, setNoRefresh] = useReducer(false);

    const cookies = parseCookies();

    const contextValue = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    useEffect(async () => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEURL}/settings/public-settings`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        )

        const result = await response.json();
        dispatch({
            type: "setSiteInfo",
            value: result
        });
        if (!cookies.userToken) {
            dispatch({
                type: "setLoginStatus",
                value: false
            });
        }
    }, [noRefresh]);

    useEffect(() => {
        if (localStorage.getItem("loginState")) {
            dispatch({
                type: "initStored",
                value: JSON.parse(localStorage.getItem("loginState"))
            });
        }
    }, []);

    useEffect(() => {
        if (state !== initialState.login) {
            localStorage.setItem("loginState", JSON.stringify({
                login: state.login,
                sidebarToggle: state.sidebarToggle,
                tradingviewTheme: state.tradingviewTheme,
                siteInfo: state.siteInfo ? state.siteInfo : {},
                darkModeToggle: state.darkModeToggle,
                // userInfo: state.userInfo ? state.userInfo : null,
                // adminInfo: state.adminInfo ? state.adminInfo : null,
                // priceInfo: state.priceInfo ? state.priceInfo : null,
                userLoading: state.userLoading ? state.userLoading : true,
                priceLoading: state.priceLoading ? state.priceLoading : true,
                showAuthenticate: false,
                openBottomAuthenticate: false,
                hasMessage: false,
                refreshData: false,
                refreshInventory: false,
                refreshUnreadTickets: false,
                snackbarProps: { open: false, content: '', type: 'success', duration: 3000, refresh: 1 }
            }));
        }
    }, [state]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}

/**
 * Custom hook that returns the current value of the AppContext.
 * @returns The current value of the AppContext.
 */
export const useAppContext = () => {
    return useContext(AppContext);
}