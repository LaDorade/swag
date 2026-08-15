import { untrack } from "svelte";
import { resolveSchema, type ResolutionResult } from "../Schema/resolveSchema";

import { settings } from "./Settings.svelte";

import type { ResolvedSchema, UnresolvedSchema } from "#types"
import type {
    OpenAPIObject,
    ReferenceObject,
} from "#types/oas.js"
import { RefResolver, type ReferencableTypes, type ResolvedRef } from "../openApi/RefResolver";


class Spec {
    spec?: OpenAPIObject;

    errors: Record<string, string> = $state({});

    refResolver?: RefResolver;

    #getRefResolver() {
        if (!this.spec) {
            throw new Error("Spec not initialized");
        }
        if (!this.refResolver) {
            this.refResolver = new RefResolver(this.spec);
        }
        return this.refResolver;
    }

    resolveRef<T extends ReferencableTypes>(
        ref: ReferenceObject
    ): ResolvedRef<T> {
        // TODO: function will become async
        const res = this.#getRefResolver().resolve<T>(ref)

        // FIXME: don't do that, dont use $derived with this
        untrack(() => {
            if (res.error) {
                this.errors[ref.$ref] = res.error;
            }
        });
        return res;
    }

    resolveObject<T extends ReferencableTypes>(
        obj: T | ReferenceObject
    ): T | null {
        if ("$ref" in obj) {
            const res = this.resolveRef<T>(obj);
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
        return resolveSchema(
            this.#getRefResolver(),
            schema,
            depth,
            settings.resolution.forwardReferenceMaxDepth
        )
    }

    _shouldResolveArraySubSchema(
        resolvedSchema: ResolutionResult,
        resolutionDepth: number
    ): boolean {
        if (!resolvedSchema.schema.items) {
            return false;
        }
        if (resolvedSchema?.resolutionType === 'resolved'){
            if (resolutionDepth <= 1) {
                return settings.resolution.alwaysResolveArraySubSchema;
            }
        } else if (resolvedSchema?.resolutionType === 'inline'){
            if (resolutionDepth <= 0) {
                return settings.resolution.alwaysResolveArraySubSchema;
            }
        }
        return resolvedSchema.resolved;
    }
    _newDepth(depth: number, resolutionType: ResolutionResult['resolutionType']): number {
        depth = depth - 1;
        // Inline ARE in the schema, so we dont count them
        if (resolutionType === 'inline') {
            return depth + 1;
        }
        return Math.max(depth, 0);
    }
    _newInnerArrayDepth(
        depth: number,
        resolutionType: ResolutionResult['resolutionType'],
        resolvedArrayInnerSchemaResolutionType: ResolutionResult['resolutionType']
    ): number {
        depth = depth - 1;
        // Special case of inline schema array with inline subSchema
        if (settings.resolution.alwaysResolveArraySubSchema
            || (resolutionType === 'inline'
                && resolvedArrayInnerSchemaResolutionType === 'inline')) {
            depth += 1;
        }
        return Math.max(depth, 0);
    }



    /**
     * Resolves a schema full, including any referenced schemas.
     * Until the schema is fully resolved, the depth is reduced to 0.
     */
    resolveSchemaFull(schema: UnresolvedSchema, depth: number): ResolvedSchema | UnresolvedSchema {
        const res = resolveSchema(
            this.#getRefResolver(),
            schema,
            depth,
            settings.resolution.forwardReferenceMaxDepth
        );
        const newDepth = this._newDepth(depth, res.resolutionType);
        if (newDepth <= 0) {
            return res.schema;
        }

        if (res.schema.properties) {
            for (const key in res.schema.properties) {
                const obj = this.resolveSchemaFull(res.schema.properties[key], newDepth);
                res.schema.properties[key] = obj;
            }
        }
        if (res.schema.items && this._shouldResolveArraySubSchema(res, depth)) {
            // Avoid resolving the inner schema twice
            const innerResolutionType = res.schema.items.$ref ? 'resolved' : 'inline';
            const innerArrayDepth = this._newInnerArrayDepth(depth, res.resolutionType, innerResolutionType);

            const arr = this.resolveSchemaFull(res.schema.items, innerArrayDepth);
            res.schema.items = arr;
        }
        return res.schema;
    }
}

export const specStore = new Spec()
