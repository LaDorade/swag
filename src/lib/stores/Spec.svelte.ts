import type { ResolvedSchema, UnresolvedSchema } from "#types"
import { settings } from "./Settings.svelte";


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

        const schemaFromRef = specStore.resolveRef(this._schema.$ref)
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
    spec: object = {}

    // https://spec.openapis.org/oas/v3.2.0.html#appendix-f-examples-of-base-uri-determination-and-reference-resolution
    resolveRef = (
        uri: string
    ): UnresolvedSchema | null => {
        if (!uri.startsWith("#/")) {
            return null;
        }

        // Ex:
        // #/components/schemas/Animal
        // #/Snoup
        // #/a/b

        let cur = this.spec;
        const segments = uri.slice(2).split('/')
        for (let i = 0; i < segments.length; i++) {
            cur = cur?.[segments[i]]
        }
        if (!cur) {
            return null
        }
        return cur;
    }

    resolveSchema (schema: UnresolvedSchema, depth: number): ResolutionResult {
        return Resolver.resolve(schema, depth)
    }
}

export const specStore = new Spec()
