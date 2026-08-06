export function getOperationAnchor(method: string, path: string): string{
    const uri = encodeURIComponent(`operation:${method}-${path}`);
    return uri
}

export function getSchemaAnchor(name: string): string {
    const anchor = encodeURIComponent(`schema:${name}`)
    return anchor;
}

export function resolveRef(
    spec: any,
    uri: string,
): object {
    if (uri.startsWith('http')) {
        throw new Error("Unsupported reference by http")
    }

    // Ex:
    // #/components/schemas/Animal
    // #/Snoup
    // #/a/b
    if (uri.startsWith("#/")) {
        const segments = uri.slice(2).split('/')
        console.log("Resolving:", uri)
        // same file ref
        let cur = spec;
        for (let i = 0; i < segments.length; i++) {
            cur = cur?.[segments[i]]
        }
        return cur;
    }

    // https://spec.openapis.org/oas/v3.2.0.html#appendix-f-examples-of-base-uri-determination-and-reference-resolution
    throw new Error("Unsupported relative references")
}
