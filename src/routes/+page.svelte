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
    <main class="flex flex-col gap-4 w-full p-4 overflow-auto">
        <details open class="flex flex-col open:gap-2">
            <summary class="flex items-center list-none text-lg
                bg-gray-50
                border border-gray-200 rounded p-2">
                <h2 class="text-xl">
                    Settings
                </h2>
                <span class="text-xs text-gray-600 ml-auto pr-2 block in-open:hidden">▼</span>
                <span class="text-xs text-gray-600 ml-auto pr-2 hidden in-open:block">▲</span>
            </summary>
            <div class="font-mono text-xs grid grid-cols-2 gap-4">
                <div class="p-2 flex flex-col border border-gray-200 rounded">
                    <span class="font-bold text-base">Resolution des $ref</span>
                    <label class="flex items-center gap-2">
                        Profondeur max:
                        <input class="w-fit appearance-none"
                            min="0"
                            type="number" bind:value={settings.resolution.schemaMaxResolutionDepth}>
                    </label>
                    <label class="flex items-center gap-2">
                        Profondeur max (références directes)
                        <input class="w-fit appearance-none"
                            min="0"
                            type="number" bind:value={settings.resolution.forwardReferenceMaxDepth}>
                    </label>
                    <label class="flex items-center gap-2">
                        Toujours résoudre les sous-schémas des arrays
                        <input class="inline"
                            type="checkbox" bind:checked={settings.resolution.alwaysResolveArraySubSchema}>
                    </label>
                </div>
                <div class="p-2 flex flex-col border border-gray-200 rounded">
                    <span class="font-bold text-base">Display</span>
                    <label class="flex items-center gap-2">
                        Afficher les chemins des propriétés
                        <input class="inline"
                            type="checkbox" bind:checked={settings.display.showPropertiesPaths}>
                    </label>
                    <label class="flex items-center gap-2">
                        Afficher la ligne "Items" dans les arrays
                        <input class="inline"
                            type="checkbox" bind:checked={settings.display.showItemsLineOnArray}>
                    </label>
                </div>
            </div>
        </details>
        <details open class="flex flex-col open:gap-2">
            <summary class="flex items-center list-none text-lg
                bg-gray-50
                border border-gray-200 rounded p-2">
                <h2 id="paths" class="text-xl">
                    Paths
                </h2>
                <span class="text-lg text-gray-600 pl-1">({Object.keys(paths).length})</span>
                <span class="text-xs text-gray-600 ml-auto pr-2 block in-open:hidden">▼</span>
                <span class="text-xs text-gray-600 ml-auto pr-2 hidden in-open:block">▲</span>
            </summary>
            <div class="flex flex-col gap-4 py-2 pl-2 border-l border-gray-200">
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
        </details>
        <details class="flex flex-col open:gap-2">
            <summary class="flex items-center list-none text-lg
                bg-gray-50
                border border-gray-200 rounded p-2">
                <h2 class="text-xl" id="schemas">
                    Schemas
                </h2>
                <span class="text-lg text-gray-600 pl-1">({Object.keys(schemas).length})</span>
                <span class="text-xs text-gray-600 ml-auto pr-2 block in-open:hidden">▼</span>
                <span class="text-xs text-gray-600 ml-auto pr-2 hidden in-open:block">▲</span>
            </summary>
            <div class="flex flex-col gap-4 py-2 pl-2 border-l border-gray-200">
                {#each Object.entries(schemas) as [name, schema] (name)}
                    {@const anchor = getSchemaAnchor(`#/components/schemas/${name}`)}
                    <div id={anchor}
                        class="p-2 bg-gray-50 rounded border border-gray-200
                        target:animate-hightlight"
                    >
                        <Schema
                            {name}
                            schema={schema as any}
                            resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
                            open
                        />
                    </div>
                {/each}
            </div>
        </details>
    </main>
</div>
