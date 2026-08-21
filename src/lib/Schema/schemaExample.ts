import { deduceSchemaType } from "#lib";
import type { ResolvedSchema, UnresolvedSchema } from "#types";

export function schemaToExample(schema: ResolvedSchema | UnresolvedSchema): unknown {
    const type = deduceSchemaType(schema);

    if (schema.examples?.length) {
        return schema.examples[0];
    }
    if (schema.default) {
        return schema.default;
    }

    if (type === 'array') {
        if (schema.items) {
            const childExample = schemaToExample(schema.items);
            return [childExample];
        } else {
            return [];
        }
    } else if (type === 'object') {
        if (schema.properties) {
            return {
                ...Object.entries(schema.properties).reduce((acc, [name, s]) => {
                    if (name) {
                        acc[name] = schemaToExample(s)
                    }
                    return acc;
                }, {} as Record<string, unknown>),
            };
        } else {
            return {};
        }
    } else if (type === 'string') {
        return "string";
    } else if (type === 'number' || type === 'integer') {
        return 67;
    } else if (type === 'boolean') {
        return false;
    }
    console.warn(`[SchemaToExample] Unsupported schema type: ${type}`);
    return "<not_set>";
}
