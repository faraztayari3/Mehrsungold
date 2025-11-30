// Context
import { useAppContext } from "../context/AppContext"

/**
 * Initializes the floor number based on the given number and symbol.
 * @param {number} number - The number to initialize the floor number.
 * @param {string} symbol - The symbol to use for formatting the floor number.
 * @returns {string} - The formatted floor number.
 */
const InitFloorNumber = (number, symbol) => {

    const { state } = useAppContext();
    const { siteInfo } = state;

    // const siteInfo = JSON.parse(localStorage.getItem('siteInfo'));

    /**
     * Rounds a number down to a specified number of decimal places.
     * @param {number} number - The number to round down.
     * @param {number} decimal - The number of decimal places to round down to.
     * @returns {number} - The rounded down number.
     */
    const floorNumber = (number, decimal) => {
        return Number(Math.floor(number * 10 ** decimal) / 10 ** decimal);
    }
    const decimal = symbol ? siteInfo && siteInfo.symbols ?
        siteInfo.symbols[symbol] != null || siteInfo.symbols[symbol] !== undefined ? siteInfo.symbols[symbol] == -1 ? 6 : siteInfo.symbols[symbol]
            : 6 : 6 : 6;
    console.log(111, typeof floorNumber(number, parseInt(decimal)), floorNumber(number, parseInt(decimal)), floorNumber(number, parseInt(decimal)).toLocaleString('en-US', { maximumFractionDigits: parseInt(decimal) }));
    return floorNumber(number, parseInt(decimal)).toLocaleString('en-US', { maximumFractionDigits: parseInt(decimal) });
}

export default InitFloorNumber;