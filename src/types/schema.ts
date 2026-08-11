export type TODO = any;

export type ValidOpenAPITypes =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'object'
    | 'array'
    // | 'null' // null is not supported in OAS, but in Json Schema
    ;

/**
 * Based on,
 * MIT
 * Copyright (C) 2012-2015 Tom de Grunt <tom@degrunt.nl>
 * with some modifications
 */
export interface SchemaObject {
    $ref?: string
    title?: string
    description?: string

    items?: SchemaObject | object // mandatory for array types, {} (object) is the any type
    properties?: {
        [name: string]: SchemaObject
    }
    additionalProperties?: boolean | SchemaObject | object

    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: number | boolean
    minimum?: number
    exclusiveMinimum?: number | boolean
    maxLength?: number
    minLength?: number
    pattern?: string | RegExp
    maxItems?: number
    minItems?: number
    uniqueItems?: boolean
    maxProperties?: number
    minProperties?: number
    required?: string[] | boolean
    definitions?: {
        [name: string]: SchemaObject
    }
    'enum'?: any[]
    format?: string
    allOf?: SchemaObject[]
    anyOf?: SchemaObject[]
    oneOf?: SchemaObject[]
    not?: SchemaObject
    if?: SchemaObject
    then?: SchemaObject
    else?: SchemaObject
    default?: any
    examples?: any[]

    // Only OAS
    type?: string; // in OAS, type is a single value, use oneOf to mutiples
    nullable?: boolean // OAS specific, null isn't a type
    deprecated?: boolean;
    discriminator?: TODO;
    externalDocs?: TODO;
    readonly?: boolean;
    writeOnly?: boolean;
    xml?: TODO;
    /**
     * @deprecated
     */
    example: any;


    // Not supported by the OAS
    // type?: string | string[]
    // $id?: string
    // id?: string
    // $schema?: string
    // additionalItems?: boolean | Schema
    // propertyNames?: boolean | Schema
    // patternProperties?: {
    //     [name: string]: Schema
    // }
    // dependencies?: {
    //     [name: string]: Schema | string[]
    // }
    // const?: any
    // contains?: Schema
}
