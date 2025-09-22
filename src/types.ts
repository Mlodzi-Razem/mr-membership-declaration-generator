export type NumberCharacter = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type GrowToSize<T, N extends number, A extends T[]> =
    A['length'] extends N ? A : GrowToSize<T, N, [...A, T]>;

export type FixedArray<T, N extends number> = GrowToSize<T, N, []>;