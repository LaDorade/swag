import type { UnresolvedSchema, ResolvedSchema, Schema } from "#types";
import type { ReferenceObject } from "#types/oas.js";
import type { RefResolver } from "#lib/openApi/RefResolver.js";

export const resolutionType = [
    'inline',
    'resolved',
    'maxDepth',
    'unresolved',
    'circular',
] as const;

export type ResolutionType = typeof resolutionType[number];

export type ResolutionResult =
    |({ resolutionType: 'inline';     schema: ResolvedSchema }
    | { resolutionType: 'resolved';   schema: ResolvedSchema }
    | { resolutionType: 'maxDepth';   schema: UnresolvedSchema }
    | { resolutionType: 'unresolved'; schema: UnresolvedSchema }
    | { resolutionType: 'circular';   schema: UnresolvedSchema })
    & {
        path: UnresolvedSchema[];
        resolved: boolean;
        origin: UnresolvedSchema;
        name?: string;
    }

/**
 * Resolves a schema, following `$ref` if present
 * This will NOT resolved inner `$ref` in items, or `$ref` in properties and more
 * Inline schema (a.k.a. without `$ref`) are returned instantly with metadata
 * If you pass depth = 0, this will not try to resolve anything (but return metadata & the schema if it's inline)
 * Depth is only for two purposes:
 *  - If you are using some sort of recursion and want to stop without handling a custom case for 0 (a "stop" case) & have metadata
 *  - To track how deep we are following forward references ($ref -> $ref -> ...)
 *
 * @param refResolver
 * @param schema
 * @param depth - Where YOU are in the recursion
 * @param forwardRefDepth - How deep we are following forward references
 * @returns The resolution result.
 */
export function resolveSchema(
    refResolver: RefResolver,
    schema: UnresolvedSchema,
    depth: number = 0,
    forwardRefDepth: number = 0,
): ResolutionResult {
    const path = [schema];
    const origin = schema;
    if (!schema.$ref) {
        return {
            origin: origin,
            resolutionType: 'inline',
            schema: schema as ResolvedSchema,
            path: path,
            resolved: true
        }
    }

    const resolvedRef = refResolver.resolve<Schema | ReferenceObject>({$ref: schema.$ref})
    if (!resolvedRef.resolved) {
        return {
            origin: origin,
            resolutionType: 'unresolved',
            schema: schema,
            path: path,
            resolved: false,
            name: resolvedRef?.name
        }
    }

    if (depth <= 0) {
        return {
            origin: origin,
            resolutionType: 'maxDepth',
            schema: schema,
            path: path,
            resolved: false,
            name: resolvedRef?.name
        }
    }

    // TODO: cycle detection instead of depth - 1
    const resolved = resolveSchema(
        refResolver,
        resolvedRef.resolved,
        forwardRefDepth,
        forwardRefDepth - 1
    );
    if (resolved.resolutionType === 'inline') {
        return {
            resolutionType: 'resolved',
            resolved: true,
            origin: origin,
            schema: resolved.schema,
            path: [...path, ...resolved.path],
            name: resolvedRef.name
        }
    } else {
        path.push(resolved.schema)
        return {
            ...resolved,
            origin: origin,
            path: [...path, ...resolved.path],
            name: resolved.name ?? resolvedRef.name
        }
    }
}
