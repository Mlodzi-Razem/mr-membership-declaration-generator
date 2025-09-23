export default function distinct<T>(arr: T[]) {
    return [...new Set(arr)];
}