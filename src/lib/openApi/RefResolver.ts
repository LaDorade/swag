import type { OpenAPIObject, } from "#types/oas.js"

export type ResolvedRef<T> =
    ( { obj: T;    ref?: string;  ok: true }
    | { obj: null; error: string; ok: false })
    & {
        name?: string;
    }

/**
 * https://spec.openapis.org/oas/v3.2.0.html#appendix-f-examples-of-base-uri-determination-and-reference-resolution
 * Given a reference object and a spec, resolve the reference to a value.
 */
export function resolveRef<T>(
    ref?: {$ref?: string},
    spec?: OpenAPIObject,
): ResolvedRef<T> {
    if (!ref || !ref.$ref) return {
        obj: null, error: 'Missing ref', ok: false,
    };
    if (!spec) return {
        obj: null,
        error: 'Missing Spec',
        ok: false,
    };

    const uri = ref.$ref;
    if (!uri.startsWith("#/")) {
        return {
            obj: null,
            error: `Only local references are supported: ${uri}`,
            ok: false,
        };
    }

    const path = uri.slice(2).split('/');
    const name = path.slice(-1)[0];
    let cur: any = spec;
    for (const seg of path) {
        cur = cur?.[seg];
        if (!cur) {
            return {
                obj: null,
                name,
                error: `Local Reference not found: ${uri}`,
                ok: false,
            };
        }
    }
    return {
        obj: cur,
        name,
        ref: uri,
        ok: true,
    };
}

/**
 * Small wrapper around {@link resolveRef} & a spec to caches results.
 */
export class RefResolver {
    spec: OpenAPIObject;
    cache: Record<string, ResolvedRef<unknown>> = {};

    constructor(spec: OpenAPIObject) {
        this.spec = spec;
    }

    resolve<T>(ref: {$ref?: string}): ResolvedRef<T> {
        if (!ref || !ref.$ref) return {
            ok: false,
            obj: null,
            error: 'Missing Ref'
        };
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
