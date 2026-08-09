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

export interface Schema {
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

    // TODO:
    // https://spec.openapis.org/oas/v3.2.0.html#generic-data-structure-model
    // $id, $defs, $dynamicDefs, $dynamicAnchor
    // discriminator
    // allOf
    // anyOf
    // oneOf
}
