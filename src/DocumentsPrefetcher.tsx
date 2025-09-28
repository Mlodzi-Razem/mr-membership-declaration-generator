import {usePrefetchQuery} from "@tanstack/react-query";
import {getPdfQueriesOptions, getUseHelveticaBytesOptions} from "./hooks/useFillDocumentsFunctions.tsx";

export default function DocumentsPrefetcher() {
    const optionsToPrefetch = [
        ...getPdfQueriesOptions(),
        getUseHelveticaBytesOptions()
    ];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    optionsToPrefetch.forEach(options => usePrefetchQuery(options as never));

    return <></>;
}