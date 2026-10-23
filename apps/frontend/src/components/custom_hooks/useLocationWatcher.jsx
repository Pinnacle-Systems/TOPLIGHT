import { useEffect, useRef, useState } from "react";
import { startWatchingLocation, stopWatchingLocation } from "../utils/CustomLocation";

const useLocationWatcher = ({ enable = true } = {}) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (!enable) return;
        let cancelled = false;

        (async () => {
            try {
                const id = await startWatchingLocation(
                    (position) => {
                        if (cancelled) return;
                        const { latitude, longitude } = position.coords;
                        setLocation({ latitude, longitude });
                        setError(null);
                    },
                    (msg) => {
                        if (!cancelled) setError(msg);
                    },
                );

                if (cancelled) {
                    stopWatchingLocation(id);   // unmounted while awaiting permission
                } else {
                    watchIdRef.current = id;
                }
            } catch (e) {
                if (!cancelled) setError(e.message);
            }
        })();

        return () => {
            cancelled = true;
            stopWatchingLocation(watchIdRef.current);
            watchIdRef.current = null;
        };
    }, [enable]);

    return { location, error };
};

export default useLocationWatcher;