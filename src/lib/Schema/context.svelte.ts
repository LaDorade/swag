export class SchemaCTX {
    name: string | null = null;
    type: string | null = null;
    childs: SchemaCTX[] = [];

    constructor(name: string | null, type: string | null) {
        this.name = name;
        this.type = type;
    }

    static createArray(): SchemaCTX {
        const child = new SchemaCTX(null, "array");
        return child;
    }

    static createObject(name: string | null): SchemaCTX {
        const child = new SchemaCTX(name, "object");
        return child;
    }

    createField(): SchemaCTX {
        const child = new SchemaCTX(null, null);
        this.childs.push(child);
        return child;
    }

    registerSelf(name: string | null, type: string | null) {
        this.name = name;
        this.type = type;
    }

    toJSON(): object {
        return {
            name: this.name,
            type: this.type,
            childs: this.childs.map(c => c.toJSON()),
        };
    }

    toExample(): unknown {
        if (this.type === 'array') {
            const childExample = this.childs[0]?.toExample();
            return [childExample];
        } else if (this.type === 'object') {
            return {
                ...this.childs.reduce((acc, c) => {
                    if (c.name) {
                        acc[c.name] = c.toExample();
                    }
                    return acc;
                }, {} as Record<string, unknown>),
            };
        } else if (this.type === 'string') {
            return "string";
        } else if (this.type === 'number' || this.type === 'integer') {
            return 67;
        } else if (this.type === 'boolean') {
            return false;
        }
        return "<not_set>";
    }
}
