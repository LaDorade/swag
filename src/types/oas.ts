import type { Schema } from "#types";

export interface OpenAPIObject {
    openapi: string;
    $self?: string;
    info: InfoObject;
    jsonSchemaDialect?: string;
    servers?: ServerObject[];
    paths?: PathsObject;
    webhooks?: Record<string, PathItemObject>
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject
}

export interface ComponentsObject {
    schemas?: Record<string, Schema>;
    responses?: Record<string, ResponseObject | ReferenceObject>;
    parameters?: Record<string, ParameterObject | ReferenceObject>;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
    links?: Record<string, LinkObject | ReferenceObject>;
    callbacks?: Record<string, CallbackObject | ReferenceObject>;
    pathItems?: Record<string, PathItemObject>;
    mediaTypes?: Record<string, MediaTypeObject | ReferenceObject>;
}

export interface InfoObject {
    title: string;
    summary?: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
}

export type PathsObject = {
    [K in `/${string}`]: PathItemObject;
}

export interface PathItemObject {
    $ref?: string // not a Reference Object: https://spec.openapis.org/oas/v3.2.0.html#fixed-fields-6
    summary?: string;
    description?: string;
    get?: OperationObject;
    put?: OperationObject;
    post?: OperationObject;
    delete?: OperationObject;
    options?: OperationObject;
    head?: OperationObject;
    patch?: OperationObject;
    trace?: OperationObject;
    query?: OperationObject;
    additionalOperations?: Record<string, OperationObject>;
    servers?: ServerObject[];
    parameters?: ParameterObject[]
}

export interface OperationObject {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    operationId?: string;
    parameters?: (ParameterObject | ReferenceObject)[];
    requestBody?: RequestBodyObject | ReferenceObject;
    responses?: ResponsesObject;
    callbacks?: Record<string, CallbackObject | ReferenceObject>;
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
}

export interface ParameterObject {
    name: string;
    in: 'query' | 'querystring' | 'header' | 'path' | 'cookie' | (string & {});
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    example?: any;
    examples?: Record<string, ExampleObject>;

    // Only set if content field is present
    content?: Record<string, MediaTypeObject | ReferenceObject>;

    // Only set if schema field is present
    schema?: Schema;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}

export interface RequestBodyObject {
    description?: string;
    content: Record<string, MediaTypeObject | ReferenceObject>;
    required?: string;
}

export type ResponsesObject = Record<string, ResponseObject | ReferenceObject>;
export interface ResponseObject {
    summary?: string;
    description?: string;
    headers?: Record<string, HeaderObject>;
    content?: Record<string, MediaTypeObject>;
    links?: Record<string, LinkObject>;
};

export interface MediaTypeObject {
    schema?: Schema;
    itemSchema?: Schema;
    example?: any;
    examples?: Record<string, ExampleObject>;
    encoding?: Record<string, EncodingObject>;
    prefixEncoding?: EncodingObject[];
    itemEncoding?: EncodingObject;
}

export interface HeaderObject {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    example?: any;
    examples: Record<string, ExampleObject>;
};

export interface ReferenceObject {
    $ref: string;
    summary?: string;
    description?: string;
};

export interface TagObject {
    name: string;
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject;
    parent?: string;
    kind?: string;
}
export interface SecuritySchemeObject {
    type: "http" | "mutualTLS" | "oauth2" | "openIdConnect";
    description?: string;
    name: string;
    in: "query" | "header" | "cookie";
    scheme?: string; // required & only for "http" type
    bearerFormat?: string; // only for "http" type
    flows?: OAuthFlowsObject; // required & only for "oauth" type
    openIdConnectUrl?: string; // required & only for "openIdConnect" type
    oauth2MetadataUrl?: string; // only for "oauth" type
    deprecated?: boolean;
}
export interface OAuthFlowsObject {
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    authorizationCode?: OAuthFlowObject;
    deviceAuthorization?: OAuthFlowObject;
}
export interface OAuthFlowObject {
    authorizationUrl?: string; // required & only for "implicit"/"authorizationCode"
    deviceAuthorizationUrl?: string; // required & only for "deviceAuthorization"
    tokenUrl?: string; // required & only for "passord"/"clientCredentials"/"authorizationCode"/"deviceAuthorization"
    refreshUrl?: string;
    scopes: Record<string, string>;
}
export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
}
export interface LicenseObject {
    name: string;
    identifier?: string;
    url?: string;
}
export interface ExternalDocumentationObject {
    description?: string;
    url: string;
};
export type CallbackObject = Record<string, PathItemObject>;
export type SecurityRequirementObject = Record<string, string[]>;
export interface EncodingObject {
    contentType?: string;
    headers?: Record<string, HeaderObject>;
    encoding?: Record<string, EncodingObject>;
    prefixEncoding?: EncodingObject[];
    itemEncoding?: EncodingObject;
}
export interface ExampleObject {
    summary?: string;
    description?: string;
    dataValue?: any;
    serializedValue?: string;
    externalValue?: string;
    value?: any;
}
export interface LinkObject {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, any>;
    requestBody?: any;
    description?: string;
    server?: ServerObject;
}
export interface ServerObject {
    url: string;
    description?: string;
    name?: string;
    variables?: Record<string, ServerVariableObject>;
}
export interface ServerVariableObject {
    enum: string[];
    default: string;
    description?: string;
}
