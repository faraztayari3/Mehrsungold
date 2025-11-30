import { useEffect, useState } from "react";
// import { Button } from "@material-tailwind/react";

/**
 * A component that displays a "Tap to Top" button when the user scrolls down the page.
 * @returns The TapToTop component.
 */
const TapToTop = () => {

    const [showTapToTop, setShowTapToTop] = useState(false);

    /**
     * Adds an event listener to the window object that listens for scroll events and
     * triggers the tapToTopScrollLinstener function.
     * @returns None
     */
    useEffect(() => {
        window.addEventListener("scroll", tapToTopScrollLinstener);
    });

    /**
     * Listens for scroll events and updates the state of the "showTapToTop" variable
     * based on the scroll position.
     * @returns None
     */
    const tapToTopScrollLinstener = () => {
        if (window.scrollY > 100 == true) {
            setShowTapToTop(true);
        }
        else {
            setShowTapToTop(false);
        }
    }

    /**
     * Scrolls the window to the top of the page with a smooth animation.
     * @returns None
     */
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        showTapToTop ?
            null
            // <Button type="button"
            //     className="!fixed z-50 bottom-[5%] left-[5%] flex justify-center items-center bg-black rounded-[10px] shadow-lg p-2 dark:bg-white" onClick={scrollToTop}>
            //     <img src={"/assets/img/svg/arrowdown.svg"} alt="arrowdown" width={100} height={24} className="filter-icon w-6 h-6 rotate-180" /></Button>
            :
            ''
    )
}

export default TapToTop;