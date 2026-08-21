import type { OperationObject } from "./oas";

export interface UnresolvedSchema {
    description?: string;
    type?: string;
    format?: string;
    default?: any;

    const?: string;
    enum?: string[];

    required?: string[];
    properties?: Record<string, UnresolvedSchema>;
    additionalProperties?: boolean; // TODO: support OAS Extension

    items?: UnresolvedSchema,

    minimum?: number;
    maximum?: number;

    examples?: any[];

    $ref?: string;
}

export interface OperationT {
    path: string,
    method: string,
    operationData: OperationObject;
};

export type ResolvedSchema = UnresolvedSchema & {$ref?: never}
export type Schema = UnresolvedSchema;

export const allowedOpenAPITypes = [
    'string', 'number', 'integer',
    'boolean', 'object', 'array'
] as const;

export type AllowedOpenAPITypes = typeof allowedOpenAPITypes[number];

export type DeductedType =
    | AllowedOpenAPITypes
    | "allOf"
    | "anyOf"
    | "oneOf"
    | "invalid"
