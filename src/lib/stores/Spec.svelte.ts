import { untrack } from "svelte";
import { Resolver, type ResolutionResult } from "./Resovler.svelte";

import type { UnresolvedSchema } from "#types"
import type {
    HeaderObject,
    MediaTypeObject,
    OpenAPIObject,
    ParameterObject,
    PathItemObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject,
    ServerObject
} from "#types/oas.js"

type ReferencableTypes =
    | ParameterObject
    | ResponseObject
    | RequestBodyObject
    | MediaTypeObject
    | HeaderObject;


class Spec {
    spec?: OpenAPIObject;

    errors: Record<string, string> = $state({});

    // https://spec.openapis.org/oas/v3.2.0.html#appendix-f-examples-of-base-uri-determination-and-reference-resolution
    // FIXME: put into Resolver
    resolve<T extends ReferencableTypes>(
        ref: ReferenceObject
    ): {resolved: T | ReferenceObject | null, name?: string} {
        const uri = ref.$ref;
        if (!uri.startsWith("#/")) return { resolved: null };
        if (!this.spec) return { resolved: null };

        const path = uri.slice(2).split('/');
        const name = path.slice(-1)[0];
        let cur: any = this.spec;
        for (const seg of path) {
            cur = cur?.[seg];
            if (!cur) {
                // avoid @svelte:state_unsafe_mutation errors
                // FIXME: don't do that, dont use $derived with this
                untrack(() => {
                    this.errors[uri] = `Reference not found: ${uri}`;
                });
                return { resolved: null, name };
            }
        }
        return { resolved: cur, name };
    }

    resolveObject<T extends ReferencableTypes>(
        obj: T | ReferenceObject
    ): T | null {
        if ("$ref" in obj) {
            const res = this.resolve<T>(obj);
            if (!res.resolved) return null;
            // FIXME: handle multiples ref
            if ('$ref' in res.resolved) {
                // FIXME: don't do that, dont use $derived with this
                untrack(() => {
                    this.errors[obj.$ref] = `Nested references not supported: ${obj.$ref}`;
                });
                return null
            }
            return res.resolved;
        }
        return obj;
    }

    resolveSchema (schema: UnresolvedSchema, depth: number): ResolutionResult {
        return Resolver.resolve(schema, depth)
    }

    getRootServers(): ServerObject[] {
        return this.spec?.servers ?? [];
    }

    getPathServers(path: string): ServerObject[] {
        const pathServers =  this.spec
            ?.paths?.[path as keyof OpenAPIObject['paths']]
            ?.servers;

        if (!pathServers || !pathServers.length) {
            return this.getRootServers();
        }
        return pathServers;
    }

    getOperationServers(path: string, method: string): ServerObject[] {
        const operationServers = this.spec
            ?.paths?.[path as keyof OpenAPIObject['paths']]
            ?.[method as keyof PathItemObject]
            ?.servers ?? [];

        if (!operationServers || !operationServers.length) {
            return this.getPathServers(path);
        }
        return operationServers;
    }
}

export const specStore = new Spec()
