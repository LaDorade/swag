<script lang="ts">
    import { getOperationAnchor, getSchemaAnchor, resolveRef } from "#lib";
    import Operation from "#lib/Operation.svelte";
    import Schema from "#lib/Schema/Schema.svelte";
    import { specStore } from "#lib/stores/Spec.svelte.ts";
    import spec from "./spec.json"

    const paths = spec.paths
    const schemas = spec.components.schemas

    specStore.spec = spec;
</script>

<div class="h-screen w-full flex">
    <nav class="shrink-0 w-58 border-r h-full">
        <h2 class="pt-2 border-b">
            <a href="#schemas">Schemas</a>
        </h2>
        {#each Object.keys(schemas) as schema (schema)}
            {@const anchor = getSchemaAnchor(schema)}
            <a class="truncate block" href="#{anchor}">
                <span>{schema}</span>
            </a>
        {/each}
        <h2 class="pt-2 border-b">
            <a href="#paths">Paths</a>
        </h2>
        {#each Object.entries(paths) as [path, methodData] (path)}
            {#each Object.entries(methodData) as [method, {summary}] (method)}
                {@const anchor = getOperationAnchor(method, path)}
                <a class="truncate block" href="#{anchor}">
                    <span>[{method}]</span>
                    <span>{path}</span>
                    <span class="text-sm text-gray-600 italic">{summary}</span>
                </a>
            {/each}
        {/each}
    </nav>
    <main class="w-full p-4 overflow-auto">
        <div class="flex flex-col gap-2">
            <h2 id="schemas" class="pt-2 border-b">
                Schemas
            </h2>
            {#each Object.entries(schemas) as [name, schema] (name)}
                {@const anchor = getSchemaAnchor(name)}
                <div
                    id={anchor}
                    class="p-2 bg-gray-50 rounded border border-gray-200"
                >
                    <Schema
                        {name}
                        schema={schema as any}
                        open
                    />
                </div>
            {/each}
        </div>
        <div class="flex flex-col gap-2">
            <h2 id="paths" class="pt-2 border-b">
                Paths
            </h2>
            {#each Object.entries(paths) as [path, methodData] (path)}
                {#each Object.entries(methodData) as [method, data] (method)}
                    <Operation operation={{
                      method,
                      path,
                      operationData: data
                    }} />
                {/each}
            {/each}
        </div>
    </main>
</div>
