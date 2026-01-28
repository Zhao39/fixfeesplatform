import { TOKEN_EXPIRE_TIMESTAMP } from "config/constants";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogout } from 'services/authService';
import { authLogout } from 'store/reducers/auth';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';

const AutoRefresh = () => {
    const history = useNavigate()
    const dispatch = useDispatch()
    const userDataStore = useSelector((x) => x.auth);
    //console_log("AuthLogin userDataStore::::", userDataStore)
    const { token, isLoggedIn, user } = userDataStore

    const inactivityTime = TOKEN_EXPIRE_TIMESTAMP * 1000
    const timeoutRef = useRef(null);

    // Function to reset the timer
    const resetTimer = () => {
        // console.log(`resetTimer::::`)
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            console.log("No activity detected, refreshing...");
            // window.location.reload(); // Refresh the page
            doLogout()
        }, inactivityTime);
    };

    const doLogout = async () => {
        const timerStatus = window.localStorage.getItem("timerStatus")
        console.log(`timerStatus::::`, timerStatus)

        if (timerStatus === "paused") {
            return false
        }
        else {
            if (token) {
                await apiLogout(token)
                dispatch(authLogout())
            }
            const redirectUrl = "/login"
            history(redirectUrl)
        }
    }

    useEffect(() => {
        // Events to detect user activity
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Start the timer
        resetTimer();

        // Cleanup on unmount
        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return null; // No UI needed
};

export default AutoRefresh;
