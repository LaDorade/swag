import { type RefResolver, } from "#lib/openApi/RefResolver.js";
import type { ResolvedSchema, UnresolvedSchema } from "#types";
import type {
    HeaderObject,
    MediaTypeObject,
    ParameterObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject
} from "#types/oas.js"

export const resolutionType = [
    'inline',
    'resolved',
    'maxDepth',
    'unresolved',
    'circular',
    'skipped',
] as const;

export type ResolutionStatus = typeof resolutionType[number];

export type ConcretTypes =
    | ParameterObject
    | ResponseObject
    | RequestBodyObject
    | MediaTypeObject
    | HeaderObject
    | ResolvedSchema

export type ReferenceTypes =
    | ReferenceObject
    | UnresolvedSchema

export type ResolutionResult<
    Concrete extends ConcretTypes,
    Ref extends ReferenceTypes = ReferenceTypes
> =
    |({ status: 'inline';     obj: Concrete, ok: true,  origin: Concrete }
    | { status: 'resolved';   obj: Concrete, ok: true,  origin: Ref }
    | { status: 'maxDepth';   obj: Ref,      ok: false, origin: Ref }
    | { status: 'unresolved'; obj: Ref,      ok: false, origin: Ref, error: string }
    | { status: 'circular';   obj: Ref,      ok: false, origin: Ref }
    | { status: 'skipped';    obj: Ref,      ok: false, origin: Ref })
    & {
        path: (Concrete | Ref)[];
        name?: string;
    }

interface EvaluationOption {
    follow: boolean;
    maxFollow: number;
}

/**
 * Evaluate a note (openAPI Object), following `$ref` if present
 * This will NOT resolve inner `$ref`s (like in 'items' or 'properties')
 * Inline objects (a.k.a. without `$ref`) are returned instantly with metadata
 */
export function evaluateNode<
    Concrete extends ConcretTypes,
    Ref extends ReferenceTypes = ReferenceTypes
>(
    refResolver: RefResolver,
    node: Concrete | Ref,
    options: EvaluationOption = {
        follow: true,
        maxFollow: 1
    }
): ResolutionResult<Concrete, Ref> {
    const path  = [node];
    const origin = node;
    if (!("$ref" in node) || !node.$ref) {
        return {
            origin: origin as Concrete,
            status: 'inline',
            obj: node as Concrete,
            path: path,
            ok: true
        }
    }
    // after that, we are SURE that obj is a ref

    // TODO if user don't want to follow ref
    // if (!options.resolve) {
    //     return {
    //         resolutionType: 'skipped',
    //     }
    // }

    const resolvedRef = refResolver.resolve<Concrete | Ref>({$ref: node.$ref})
    if (!resolvedRef.ok) { // resolveRef failed
        return {
            status: 'unresolved',
            origin: origin as Ref,
            obj: node,
            path,
            ok: false,
            error: resolvedRef.error,
            name: resolvedRef?.name,
        }
    }

    if (!options.follow || options.maxFollow <= 0) {
        return {
            status: 'maxDepth',
            origin: origin as Ref,
            obj: node,
            path,
            ok: false,
            name: resolvedRef?.name
        }
    }

    // TODO: cycle detection instead of depth - 1
    const resolved = evaluateNode<Concrete, Ref>(
        refResolver,
        resolvedRef.obj,
        {
            follow: options.follow,
            maxFollow: options.maxFollow - 1,
        },
    );
    if (resolved.status === 'inline') { // resolveRef resolved & it was the end
        return {
            ...resolved,
            status: 'resolved',
            origin: origin as Ref,
            path: [...path, ...resolved.path],
            name: resolvedRef.name
        }
    } else {
        path.push(resolved.obj)
        return {
            ...resolved,
            origin: origin as Ref,
            path: [...path, ...resolved.path],
            name: resolved.name ?? resolvedRef.name
        }
    }
}
