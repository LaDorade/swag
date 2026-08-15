export interface UnresolvedSchema {
    description?: string;
    type?: string;
    format?: string;
    default?: string;

    const?: string;
    enum?: string[];

    required?: string[];
    properties?: Record<string, UnresolvedSchema>;
    additionalProperties?: boolean; // TODO: support OAS Extension

    items?: UnresolvedSchema,

    minimum?: number;
    maximum?: number;

    examples?: Record<string, unknown>

    $ref?: string;

    // TODO:
    // https://spec.openapis.org/oas/v3.2.0.html#generic-data-structure-model
    // $id, $defs, $dynamicDefs, $dynamicAnchor
    // discriminator
    // allOf
    // anyOf
    // oneOf
}

export type ResolvedSchema = UnresolvedSchema & {$ref?: never}


export const allowedTypes = [
    'string', 'number', 'integer',
    'boolean', 'object', 'array'
] as const;

export type AllowedTypes = typeof allowedTypes[number];

export type DeductedType =
    | AllowedTypes
    | "allOf"
    | "anyOf"
    | "oneOf"
    | "invalid"

export interface Schema {
    description?: string;
    type?: AllowedTypes | (string & {});
    format?: string;
    default?: string;

    const?: string;
    enum?: string[];

    required?: string[];
    properties?: Record<string, UnresolvedSchema>;
    additionalProperties?: boolean; // TODO: support OAS Extension

    items?: UnresolvedSchema,

    minimum?: number;
    maximum?: number;

    examples?: Record<string, unknown>

    // TODO:
    // https://spec.openapis.org/oas/v3.2.0.html#generic-data-structure-model
    // $id, $defs, $dynamicDefs, $dynamicAnchor
    // discriminator
    // allOf
    // anyOf
    // oneOf
}
