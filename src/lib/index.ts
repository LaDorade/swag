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

export function methodToColor(method: string): string {
    switch (method) {
        case 'get': return 'bg-blue-100/40'
        case 'post': return 'bg-green-100/40'
        case 'put': return 'bg-orange-100/40'
        case 'delete': return 'bg-red-100/40'
        default: return 'bg-gray-100'
    }
}

export function stringToTailwindColor(str: string): string {
    const hash = str.split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    switch (hash % 7) {
        case 0: return 'bg-blue-100/60'
        case 1: return 'bg-green-100/60'
        case 2: return 'bg-orange-100/60'
        case 3: return 'bg-red-100/60'
        case 4: return 'bg-yellow-100/60'
        case 5: return 'bg-purple-100/60'
        case 6: return 'bg-pink-100/60'
        default: return 'bg-gray-100'
    }
}
