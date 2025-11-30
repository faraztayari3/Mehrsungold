export const initialState = {
    login: false,
    sidebarToggle: false,
    tradingviewTheme: false,
    siteInfo: {},
    darkModeToggle: true,
    items: {},
    page: 1,
    userInfo: {},
    adminInfo: {},
    priceInfo: [],
    userLoading: true,
    priceLoading: true,
    showAuthenticate: false,
    openBottomAuthenticate: false,
    hasMessage: false,
    refreshData: false,
    refreshInventory: false,
    refreshUnreadTickets: false,
    snackbarProps: { open: false, content: '', type: 'success', duration: 3000, refresh: 1 }
}

/**
 * Reducer function for the App component.
 * @param {object} state - The current state of the app.
 * @param {object} action - The action object that contains the type and value.
 * @returns The updated state based on the action type.
 */
export const AppReducer = (state, action) => {

    switch (action.type) {
        case "initStored": {
            return action.value
        }
        case "setRefreshUnreadTickets": {
            return {
                ...state,
                refreshUnreadTickets: action.value,
            }
        }
        case "setRefreshInventory": {
            return {
                ...state,
                refreshInventory: action.value,
            }
        }
        case "setRefreshData": {
            return {
                ...state,
                refreshData: action.value,
            }
        }
        case "setHasMessage": {
            return {
                ...state,
                hasMessage: action.value,
            }
        }
        case "setOpenBottomAuthenticate": {
            return {
                ...state,
                openBottomAuthenticate: action.value,
            }
        }
        case "setShowAuthenticate": {
            return {
                ...state,
                showAuthenticate: action.value,
            }
        }
        case "setSnackbarProps": {
            return {
                ...state,
                snackbarProps: action.value,
            }
        }
        case "setPriceLoading": {
            return {
                ...state,
                priceLoading: action.value,
            }
        }
        case "setUserLoading": {
            return {
                ...state,
                userLoading: action.value,
            }
        }
        case "setPriceInfo": {
            return {
                ...state,
                priceInfo: action.value,
            }
        }
        case "setAdminInfo": {
            return {
                ...state,
                adminInfo: action.value,
            }
        }
        case "setUserInfo": {
            return {
                ...state,
                userInfo: action.value,
            }
        }
        case "setDatatablesItems": {
            return {
                ...state,
                items: action.value,
            }
        }
        case "setDatatablesPage": {
            return {
                ...state,
                page: action.value,
            }
        }
        case "initTradingviewTheme": {
            return {
                ...state,
                tradingviewTheme: action.value,
            }
        }
        case "sidebarToggle": {
            return {
                ...state,
                sidebarToggle: action.value,
            }
        }
        case "setLoginStatus": {
            return {
                ...state,
                login: action.value,
            }
        }
        case "setDarkModeToggle": {
            return {
                ...state,
                darkModeToggle: action.value,
            }
        }
        case "setSiteInfo": {
            return {
                ...state,
                siteInfo: action.value,
            }
        }
    }

}