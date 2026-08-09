import { settings } from "./Settings.svelte";

import type { ResolvedSchema, Schema, UnresolvedSchema } from "#types"
import type {
    OpenAPIObject,
    ParameterObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject
} from "#types/oas.js"

type ReferencableTypes =
    | ParameterObject
    | ResponseObject
    | RequestBodyObject;


type ResolutionResult =
    |({ resolutionType: 'inline';     schema: ResolvedSchema }
    | { resolutionType: 'resolved';   schema: ResolvedSchema }
    | { resolutionType: 'maxDepth';   schema: UnresolvedSchema }
    | { resolutionType: 'unresolved'; schema: UnresolvedSchema})
    & {
        path: UnresolvedSchema[];
        resolved: boolean;
        origin: UnresolvedSchema;
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
        if (!schemaFromRef) {
            return {
                origin: this._origin,
                resolutionType: 'unresolved',
                schema: this._schema,
                path: this._path,
                resolved: false
            }
        }

        if (depth <= 0) {
            return {
                origin: this._origin,
                resolutionType: 'maxDepth',
                schema: this._schema,
                path: this._path,
                resolved: false
            }
        }

        // TODO: cycle detection instead of depht - 1
        const resolved = Resolver.resolve(schemaFromRef, this._forwardRefResolutionDepth - 1);
        if (resolved.resolutionType === 'inline') {
            return {
                resolutionType: 'resolved',
                resolved: true,
                origin: this._origin,
                schema: resolved.schema,
                path: [...this._path, ...resolved.path]
            }
        } else {
            this._path.push(resolved.schema)
            return {
                ...resolved,
                origin: this._origin,
                path: [...this._path, ...resolved.path]
            }
        }
    }
}

class Spec {
    spec?: OpenAPIObject;

    // https://spec.openapis.org/oas/v3.2.0.html#appendix-f-examples-of-base-uri-determination-and-reference-resolution
    resolve<T extends ReferencableTypes>(ref: ReferenceObject): T | ReferenceObject | null {
        const uri = ref.$ref;
        if (!uri.startsWith("#/")) return null;
        if (!this.spec) return null;

        const path = uri.slice(2).split('/');
        let cur: any = this.spec;
        for (const seg of path) {
            cur = cur?.[seg];
            if (!cur) return null;
        }
        return cur;
    }

    resolveSchema (schema: UnresolvedSchema, depth: number): ResolutionResult {
        return Resolver.resolve(schema, depth)
    }
}

export const specStore = new Spec()
