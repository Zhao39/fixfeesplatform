import { BACKEND_LOCATION } from '../var/env.config';

////////// for logging /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const IGNORE_PATTERNS = []

/**
 * this function is for disable logging in live production server
 */
const overrideLogging = () => {
    if (BACKEND_LOCATION === "localhost") {
        console.log("////////////////////////// dont overrideLogging for localhost///////////////////////////")
        return false
    }

    //console.log("//////////////////////////overrideLogging///////////////////////////")

    const customLogging = function (e) {
        const eStr = String(e)
        for (let k in IGNORE_PATTERNS) {
            if (eStr.includes(IGNORE_PATTERNS[k])) {
                return false
            }
        }
        console.log(e)
    };

    console.warn = customLogging
    console.info = customLogging
    console.debug = customLogging
}

overrideLogging();

export default overrideLogging

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////