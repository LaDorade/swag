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


class Resolver {
    schema: UnresolvedSchema;
    path: UnresolvedSchema[];
    origin: UnresolvedSchema;

    private constructor(schema: UnresolvedSchema) {
        this.schema = schema;
        this.path = [schema];
        this.origin = schema;
    }

    static resolve(schema: UnresolvedSchema, depth: number): ResolutionResult {
        const resolver = new Resolver(schema);
        const resolution = resolver._resolve(depth);
        return resolution;
    }

    _resolve(depth: number): ResolutionResult {
        if (!this.schema.$ref) {
            return {
                origin: this.origin,
                type: 'inline',
                schema: this.schema as ResolvedSchema,
                path: this.path,
                resolved: true
            }
        }

        const schemaFromRef = specStore.resolveRef(this.schema.$ref)
        if (!schemaFromRef) {
            return {
                origin: this.origin,
                type: 'unresolved',
                schema: this.schema,
                path: this.path,
                resolved: false
            }
        }

        if (depth <= 0) {
            return {
                origin: this.origin,
                type: 'maxDepth',
                schema: this.schema,
                path: this.path,
                resolved: false
            }
        }

        // TODO: cycle detection instead of depht - 1
        const resolved = Resolver.resolve(schemaFromRef, depth - 1);
        if (resolved.type === 'inline') {
            return {
                type: 'resolved',
                resolved: true,
                origin: this.origin,
                schema: resolved.schema,
                path: [...this.path, ...resolved.path]
            }
        } else {
            this.path.push(resolved.schema)
            return {
                ...resolved,
                origin: this.origin,
                path: [...this.path, ...resolved.path]
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
