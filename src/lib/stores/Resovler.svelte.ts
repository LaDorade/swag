import { settings } from "./Settings.svelte";
import { specStore } from "./Spec.svelte";
import type { UnresolvedSchema, ResolvedSchema, Schema } from "#types";
import type { ReferenceObject } from "#types/oas.js";

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

export class Resolver {
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
