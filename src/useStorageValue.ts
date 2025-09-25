import {useState} from "react";

export default function useStorageValue<T extends object>(key: string, initialValue: T, options?: {storage?: Storage}): [T, (value: T) => void] {
    const storage = options?.storage ?? sessionStorage;
    const item = storage.getItem(key);

    const [, setToggledState] = useState(false);

    return [
        item === null ? initialValue : JSON.parse(item),
        (value: T) => {
            storage.setItem(key, JSON.stringify(value));
            setToggledState(prev => !prev); // rerender
        }
    ]
}