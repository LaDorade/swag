import { untrack } from "svelte";
import {
    evaluateNode,
    type ConcretTypes,
    type ReferenceTypes,
    type ResolutionResult,
    type ResolutionStatus,
} from "../openApi/resolveObject";

import { settings } from "./Settings.svelte";

import { RefResolver } from "../openApi/RefResolver";

import type { ResolvedSchema, UnresolvedSchema } from "#types"
import type {
    OpenAPIObject,
    ReferenceObject,
} from "#types/oas.js"
import { SvelteSet } from "svelte/reactivity";


class Spec {
    spec?: OpenAPIObject;

    errors = new SvelteSet<string>()

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

    evaluate<
        T extends ConcretTypes,
        R extends ReferenceTypes = ReferenceObject,
    >(
        obj: T | R,
        shouldResolveRef = true
    ): ResolutionResult<T, R> {
        const res = evaluateNode<T, R>(
            this.#getRefResolver(),
            obj,
            {
                follow: shouldResolveRef,
                maxFollow: settings.resolution.forwardReferenceMaxDepth
            },
        )
        // Don't do this, because we surely are in a $derived context
        untrack(() => {
            if (res.status === 'unresolved' && res.error) {
                this.errors.add(res.error)
            }
        })
        return res;
    }

    // FIXME: This 3 methods should be moved & renamed
    _shouldResolveArraySubSchema(
        resolvedSchema: ResolutionResult<ResolvedSchema>,
        resolutionDepth: number
    ): boolean {
        if (!('items' in resolvedSchema.obj)) {
            return false;
        }
        if (resolvedSchema?.status === 'resolved'){
            if (resolutionDepth <= 1) {
                return settings.resolution.alwaysResolveArraySubSchema;
            }
        } else if (resolvedSchema?.status === 'inline'){
            if (resolutionDepth <= 0) {
                return settings.resolution.alwaysResolveArraySubSchema;
            }
        }
        return resolvedSchema.ok;
    }
    _newDepth(depth: number, resolutionType: ResolutionStatus): number {
        depth = depth - 1;
        // Inline ARE in the schema, so we dont count them
        if (resolutionType === 'inline') {
            return depth + 1;
        }
        return Math.max(depth, 0);
    }
    _newInnerArrayDepth(
        depth: number,
        resolutionType: ResolutionStatus,
        resolvedArrayInnerSchemaResolutionType: ResolutionStatus
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
     * Until the schema is fully resolved or the depth is reduced to 0.
     */
    evaluateSchemaFull(schema: UnresolvedSchema, depth: number): ResolutionResult<ResolvedSchema, UnresolvedSchema> {
        const res = evaluateNode<ResolvedSchema, UnresolvedSchema>(
            this.#getRefResolver(),
            schema,
            {
                follow: true,
                maxFollow: settings.resolution.forwardReferenceMaxDepth
            }
        );
        const newDepth = this._newDepth(depth, res.status);
        if (newDepth <= 0) {
            return res;
        }

        if (res.obj.properties) {
            for (const key in res.obj.properties) {
                const obj = this.evaluateSchemaFull(res.obj.properties[key], newDepth);
                res.obj.properties[key] = obj.obj;
            }
        }
        if (res.obj.items && this._shouldResolveArraySubSchema(res, depth)) {
            // Avoid resolving the inner schema twice
            const innerResolutionType = res.obj.items.$ref ? 'resolved' : 'inline';
            const innerArrayDepth = this._newInnerArrayDepth(depth, res.status, innerResolutionType);

            const arr = this.evaluateSchemaFull(res.obj.items, innerArrayDepth);
            res.obj.items = arr.obj;
        }
        return res;
    }
}

export const specStore = new Spec()
