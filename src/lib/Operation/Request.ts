
const defaultFetchOptions = {
    scheme: 'http',
    server: 'localhost',
    path: '',
    method: 'GET',
    searchParams: new URLSearchParams(),
    body: undefined as string | undefined,
};
export type FetchOptions = Partial<typeof defaultFetchOptions>;

export interface FetchResult {
    ok: boolean;
    code: number;
    headers?: Headers;
    content?: string;
}

export class Fetcher {
    method: string;
    url: URL;
    body?: string;

    constructor(options: FetchOptions) {
        const {method, path, scheme, server, searchParams} = {
            ...defaultFetchOptions,
            ...options,
        };
        this.method = method
        this.url = new URL(path, `${scheme}://${server}/`);
        this.url.search = searchParams.toString();
    }

    async fetch(): Promise<FetchResult> {
        const r = await fetch(this.url, {
            method: this.method,
            body: this.body ?? undefined,
        }).catch((e) => {
            console.error(e);
            return { _internalError: true, ok: false } as const
        });

        if ("_internalError" in r) {
            return {
                ok: false,
                code: 0,
            };
        }

        return {
            ok: r.ok,
            code: r.status,
            headers: r.headers,
            content: await r.text(),
        }
    }
}
