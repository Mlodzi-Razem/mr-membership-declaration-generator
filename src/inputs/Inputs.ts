import type {FieldValues} from "react-hook-form";
import MrTextInput from "./MrTextInput.tsx";
import MrAutocomplete from "./MrAutocomplete.tsx";
import MrCheckbox from "./MrCheckbox.tsx";

/**
 * Returns a JSON object containing plain references to MR components.
 * Used for better generic types handling.
 */
export default function Inputs<F extends FieldValues>() {
    return {
        MrTextInput: MrTextInput<F>,
        MrAutocomplete: MrAutocomplete<F>,
        MrCheckbox: MrCheckbox<F>
    } as const;
}