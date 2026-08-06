import type { UnresolvedSchema } from "#types";

export function getOperationAnchor(method: string, path: string): string{
    const uri = encodeURIComponent(`operation:${method}-${path}`);
    return uri
}

export function getSchemaAnchor(name: string): string {
    const anchor = encodeURIComponent(`schema:${name}`)
    return anchor;
}

export function deduceSchemaType(s: UnresolvedSchema): string {
    // same proiority as Swagger
    if (s.type) return s.type;
    if (s.items) return 'array'
    if (s.properties) return 'object'
    return ''
}
