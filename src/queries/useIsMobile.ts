import {useEffect, useState} from "react";

const MOBILE_WIDTH = 900;

export default function useIsMobile() {
    const [mobile, setMobile] = useState(window.innerWidth < MOBILE_WIDTH);

    useEffect(() => {
        const abortController = new AbortController();

        window.addEventListener("resize", () => {
            if (mobile && window.innerWidth >= MOBILE_WIDTH) {
                setMobile(false);
            } else if (!mobile && window.innerWidth < MOBILE_WIDTH) {
                setMobile(true);
            }
        }, {signal: abortController.signal});

        return () => {
            abortController.abort();
        }
    }, [mobile, setMobile]);

    return mobile;
}
