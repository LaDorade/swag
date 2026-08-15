import type {
    HeaderObject,
    MediaTypeObject,
    OpenAPIObject,
    ParameterObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject
} from "#types/oas.js"

export type ReferencableTypes =
    | ParameterObject
    | ResponseObject
    | RequestBodyObject
    | MediaTypeObject
    | HeaderObject;

export interface ResolvedRef<T extends ReferencableTypes> {
    resolved: T | ReferenceObject | null;
    ref?: string;
    name?: string;
    error?: string;
}

/**
 * https://spec.openapis.org/oas/v3.2.0.html#appendix-f-examples-of-base-uri-determination-and-reference-resolution
 * Given a reference object and a spec, resolve the reference to a value.
 */
export function resolveRef<T extends ReferencableTypes>(
    ref?: ReferenceObject,
    spec?: OpenAPIObject,
): ResolvedRef<T> {
    if (!ref) return { resolved: null };
    if (!spec) return { resolved: null };

    const uri = ref.$ref;
    if (!uri.startsWith("#/")) {
        return { resolved: null, error: `Only local references are supported: ${uri}` };
    }

    const path = uri.slice(2).split('/');
    const name = path.slice(-1)[0];
    let cur: any = spec;
    for (const seg of path) {
        cur = cur?.[seg];
        if (!cur) {
            return { resolved: null, name, error: `Local Reference not found: ${uri}` };
        }
    }
    return {
        resolved: cur,
        name,
        ref: uri,
    };
}

/**
 * Small wrapper around {@link resolveRef} & a spec to caches results.
 */
export class RefResolver {
    spec: OpenAPIObject;
    cache: Record<string, ResolvedRef<ReferencableTypes>> = {};

    constructor(spec: OpenAPIObject) {
        this.spec = spec;
    }

    resolve<T extends ReferencableTypes>(ref: ReferenceObject): ResolvedRef<T> {
        const cached = this.cache[ref.$ref];
        if (cached) {
            // console.info(`Cache hit: ${ref.$ref}`);
            return cached as ResolvedRef<T>;
        }
        // console.info(`Cache miss: ${ref.$ref}`);
        const result = resolveRef<T>(ref, this.spec);
        this.cache[ref.$ref] = result;
        return result;
    }
}
