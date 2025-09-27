import type {FieldValues, Path} from "react-hook-form";

export type BaseProps<F extends FieldValues> = Readonly<{
    fieldName: Path<F>,
    label: string,
    required?: boolean,
    disabled?: boolean,
}>