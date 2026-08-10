import { settings } from "./Settings.svelte";

import type { ResolvedSchema, Schema, UnresolvedSchema } from "#types"
import type {
    HeaderObject,
    MediaTypeObject,
    OpenAPIObject,
    ParameterObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject
} from "#types/oas.js"

type ReferencableTypes =
    | ParameterObject
    | ResponseObject
    | RequestBodyObject
    | MediaTypeObject
    | HeaderObject;


export type ResolutionResult =
    |({ resolutionType: 'inline';     schema: ResolvedSchema }
    | { resolutionType: 'resolved';   schema: ResolvedSchema }
    | { resolutionType: 'maxDepth';   schema: UnresolvedSchema }
    | { resolutionType: 'unresolved'; schema: UnresolvedSchema})
    & {
        path: UnresolvedSchema[];
        resolved: boolean;
        origin: UnresolvedSchema;
        name?: string;
    }


class Resolver {
    _schema: UnresolvedSchema;
    _path: UnresolvedSchema[];
    _origin: UnresolvedSchema;
    _forwardRefResolutionDepth: number;

    private constructor(schema: UnresolvedSchema) {
        this._schema = schema;
        this._path = [schema];
        this._origin = schema;
        this._forwardRefResolutionDepth = $derived(settings.resolution.forwardReferenceMaxDepth);
    }

    static resolve(schema: UnresolvedSchema, depth: number): ResolutionResult {
        const resolver = new Resolver(schema);
        const resolution = resolver._resolve(depth);
        return resolution;
    }

    _resolve(depth: number): ResolutionResult {
        if (!this._schema.$ref) {
            return {
                origin: this._origin,
                resolutionType: 'inline',
                schema: this._schema as ResolvedSchema,
                path: this._path,
                resolved: true
            }
        }

        const schemaFromRef = specStore.resolve<Schema | ReferenceObject>({$ref: this._schema.$ref})
        if (!schemaFromRef.resolved) {
            return {
                origin: this._origin,
                resolutionType: 'unresolved',
                schema: this._schema,
                path: this._path,
                resolved: false,
                name: schemaFromRef?.name
            }
        }

        if (depth <= 0) {
            return {
                origin: this._origin,
                resolutionType: 'maxDepth',
                schema: this._schema,
                path: this._path,
                resolved: false,
                name: schemaFromRef?.name
            }
        }

        // TODO: cycle detection instead of depht - 1
        const resolved = Resolver.resolve(schemaFromRef.resolved, this._forwardRefResolutionDepth - 1);
        if (resolved.resolutionType === 'inline') {
            return {
                resolutionType: 'resolved',
                resolved: true,
                origin: this._origin,
                schema: resolved.schema,
                path: [...this._path, ...resolved.path],
                name: schemaFromRef.name
            }
        } else {
            this._path.push(resolved.schema)
            return {
                ...resolved,
                origin: this._origin,
                path: [...this._path, ...resolved.path],
                name: resolved.name ?? schemaFromRef.name
            }
        }
    }
}

class Spec {
    spec?: OpenAPIObject;

    // https://spec.openapis.org/oas/v3.2.0.html#appendix-f-examples-of-base-uri-determination-and-reference-resolution
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
            if (!cur) return { resolved: null, name };
        }
        return { resolved: cur, name };
    }

    resolveSchema (schema: UnresolvedSchema, depth: number): ResolutionResult {
        return Resolver.resolve(schema, depth)
    }
}

export const specStore = new Spec()
