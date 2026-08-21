import { createContext } from "svelte";
import { SvelteMap, SvelteURLSearchParams } from "svelte/reactivity";
import { Fetcher } from "./Request";

import type {
    ParameterObject,
    RequestBodyObject,
} from "#types/oas.js";
import type { OperationT } from "#types";

export class OperationContext {
    operation: OperationT;
    tryItOut: boolean = $state(false);

    requestBody: {
        obj: RequestBodyObject;
        cb: () => string | null;
    } | null = $state(null);

    parameters: {
        obj: ParameterObject;
        cb: () => string | null;
    }[] = $state([]);

    private constructor(operation: OperationT) {
        this.operation = $state(operation);
    }

    static create(operation: () => OperationT) {
        const opCtx = new OperationContext(operation());
        return setOperationContext(opCtx);
    }


    registerRequestBody(requestBody: () => RequestBodyObject | undefined, cb: () => string | null) {
        const rb = requestBody();
        if (!rb) return;

        this.requestBody = {
            obj: rb,
            cb,
        }
    }

    registerParameter(parameter: () => ParameterObject, cb: () => string | null) {
        this.parameters.push({
            obj: parameter(),
            cb,
        })
    }

    _getBody(): string | null {
        if (!this.requestBody) return null;

        return this.requestBody.cb();
    }

    _parseParam(param: string) {
        return JSON.parse(param || 'null');
    }

    _collectParams() {
        const sp = new SvelteURLSearchParams();
        const pathParams = new SvelteMap<string, string>();
        for (const {obj, cb} of this.parameters) {
            const value = cb();
            if (!value) continue;

            if (obj.in === 'query') {
                sp.append(obj.name, this._parseParam(value));
            } else if (obj.in === 'path') {
                pathParams.set(obj.name, this._parseParam(value));
            } else {
                console.warn(`Unsupported Param type: ${obj.in}`)
            }
        }
        return {
            searchParams: sp,
            pathParams,
        }
    }

    _replacePathParams(pathParams: Map<string, string>, path: string) {
        let finalPath = path;
        for (const [name, value] of pathParams.entries()) {
            finalPath = finalPath.replace(`{${name}}`, value);
        }
        return finalPath;
    }

    async executeRequest() {
        const params = this._collectParams();
        const computedPath = this._replacePathParams(params.pathParams, this.operation.path);

        const fetcher = new Fetcher({
            scheme: 'http',
            server: 'localhost',
            body: this._getBody() ?? undefined,
            path: computedPath,
            method: this.operation.method,
            searchParams: params.searchParams
        })

        console.log(fetcher.url, fetcher.body)

        const res = await fetcher.fetch()
        console.log(res)
        return res;
    }
}

const [_getOperationContext, setOperationContext] = createContext<OperationContext>();

export const getOperationContext = _getOperationContext;
