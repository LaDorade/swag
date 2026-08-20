import { createContext } from "svelte";
import type { OperationObject } from "#types/oas.js";

export class OperationContext {
    operation: OperationObject;
    tryItOut: boolean = $state(false);

    private constructor(operation: OperationObject) {
        this.operation = $state(operation);
    }

    static create(operation: () => OperationObject ) {
        const opCtx = new OperationContext(operation());
        return setOperationContext(opCtx);
    }
}

const [_getOperationContext, setOperationContext] = createContext<OperationContext>();

export const getOperationContext = _getOperationContext;
