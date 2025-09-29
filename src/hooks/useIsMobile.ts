import {useEffect, useState, useTransition} from "react";

const MOBILE_WIDTH = 1024;

export default function useIsMobile() {
    const [isTransitioning, startTransition] = useTransition();
    const [mobile, setMobile] = useState(window.innerWidth < MOBILE_WIDTH);

    useEffect(() => {
        const abortController = new AbortController();

        const changeState = (state: boolean) => {
            if (!isTransitioning) {
                startTransition(() => {
                    setMobile(state);
                });
            }
        };

        window.addEventListener("resize", () => {
            if (mobile && window.innerWidth > MOBILE_WIDTH) {
                changeState(false);
            } else if (!mobile && window.innerWidth <= MOBILE_WIDTH) {
                changeState(true);
            }
        }, {signal: abortController.signal});

        return () => {
            abortController.abort();
        }
    }, [isTransitioning, startTransition, mobile, setMobile]);

    return mobile;
}
