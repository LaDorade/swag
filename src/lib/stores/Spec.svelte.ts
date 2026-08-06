import type { ResolvedSchema, UnresolvedSchema } from "#types"


type ResolutionResult =
    |({ type: 'inline';     schema: ResolvedSchema }
    | { type: 'resolved';   schema: ResolvedSchema }
    | { type: 'maxDepth';   schema: UnresolvedSchema }
    | { type: 'unresolved'; schema: UnresolvedSchema})
    & {
        path: UnresolvedSchema[];
        resolved: boolean;
        origin: UnresolvedSchema;
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

    resolveSchema = (
        schema: UnresolvedSchema,
        depth: number,
        ctx: { path: UnresolvedSchema[], origin?: UnresolvedSchema }
            = { path: []}
    ): ResolutionResult => {
        ctx.path.push(schema)
        if (!ctx.origin) {
            ctx.origin = schema;
        }
        if (!schema.$ref) {
            return {
                origin: ctx.origin,
                type: 'inline',
                schema: schema as ResolvedSchema,
                path: ctx.path,
                resolved: true
            }
        }

        const schemaFromRef = this.resolveRef(schema.$ref)
        if (!schemaFromRef) {
            return {
                origin: ctx.origin,
                type: 'unresolved',
                schema,
                path: ctx.path,
                resolved: false
            }
        }

        if (depth <= 0) {
            return {
                origin: ctx.origin,
                type: 'maxDepth',
                schema,
                path: ctx.path,
                resolved: false
            }
        }

        const resolved = this.resolveSchema(
            schemaFromRef,
            depth - 1,
            ctx
        );
        if (resolved.type === 'inline') {
            return {
                origin: ctx.origin,
                type: 'resolved',
                schema: resolved.schema,
                path: resolved.path,
                resolved: true
            }
        } else {
            ctx.path.push(resolved.schema)
            return resolved
        }
    }
}

export const specStore = new Spec()
