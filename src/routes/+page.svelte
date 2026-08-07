<script lang="ts">
    import { getOperationAnchor, getSchemaAnchor} from "#lib";
    import Operation from "#lib/Operation.svelte";
    import Schema from "#lib/Schema/Schema.svelte";
    import { settings } from "#lib/stores/Settings.svelte.js";
    import { specStore } from "#lib/stores/Spec.svelte.js";
    import spec from "./spec.json"

    const paths = spec.paths
    const schemas = spec.components.schemas

    specStore.spec = spec;
</script>

<div class="h-screen w-full flex">
    <div class="w-fit m-2 mr-0">
        <nav class="shrink-0 w-58 h-full p-2 rounded border border-gray-100 shadow-xs">
            <h1>Swag</h1>
            <h2 class="pt-2 border-b">
                <a href="#schemas">Schemas</a>
            </h2>
            {#each Object.keys(schemas) as schema (schema)}
                {@const anchor = getSchemaAnchor(`#/components/schemas/${schema}`)}
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
    </div>
    <main class="w-full p-4 overflow-auto">
        <div class="flex flex-col gap-2">
            <h2 id="schemas" class="pt-2 border-b">
                Schemas
            </h2>
            <div class="font-mono text-sm">
                <label class="">
                    Profondeur max:
                    <input class="w-fit appearance-none"
                        min="0"
                        type="number" bind:value={settings.schemaMaxResolutionDepth}>
                </label>
                <label class="">
                    Toujours résoudre les arrays
                    <input class="inline"
                        type="checkbox" bind:checked={settings.alwaysResolveArray}>
                </label>
                <label class="">
                    Afficher la ligne "Items" dans les arrays
                    <input class="inline"
                        type="checkbox" bind:checked={settings.showItemsLineOnArray}>
                </label>
            </div>
            {#each Object.entries(schemas) as [name, schema] (name)}
                {@const anchor = getSchemaAnchor(`#/components/schemas/${name}`)}
                <div id={anchor}
                    class="p-2 bg-gray-50 rounded border border-gray-200
                    target:animate-hightlight"
                >
                    <Schema
                        {name}
                        schema={schema as any}
                        resolutionDepth={settings.schemaMaxResolutionDepth}
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
