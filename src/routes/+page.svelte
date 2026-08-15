<script lang="ts">
    import { getSchemaAnchor} from "#lib";
    import Operation from "#lib/Operation.svelte";
    import Schema from "#lib/Schema/Schema.svelte";
    import Sidebar from "#lib/Sidebar.svelte";
    import { settings } from "#lib/stores/Settings.svelte.js";
    import { specStore } from "#lib/stores/Spec.svelte.js";
    import spec from "./spec.json"

    const paths = spec.paths
    const schemas = spec.components.schemas

    // FIXME: Should have proper types & should pe passed by parent
    specStore.spec = spec;

    let sections = $state({
        errors: false,
        settings: false,
        paths: false,
        schemas: {
            open: true,
            innerOpen: true
        }
    })
</script>

<div class="h-screen w-full flex">
    <Sidebar />
    <main class="flex flex-col gap-4 w-full p-4 overflow-auto">
        <details bind:open={sections.errors} class="flex flex-col open:gap-2">
            <summary class="flex items-center list-none text-lg
                bg-gray-50
                border border-gray-200 rounded p-2">
                <h2 class="text-xl">
                    Errors
                </h2>
            </summary>
            <div class="flex flex-col gap-2 border-l border-gray-200 p-2">
                {#each Object.values(specStore.errors) as error (error)}
                    <span class="text-red-500 text-sm">{error}</span>
                {/each}
            </div>
        </details>
        <details bind:open={sections.settings} class="flex flex-col open:gap-2">
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
                        <input class="w-10 appearance-none"
                            min="0"
                            type="number" bind:value={settings.resolution.schemaMaxResolutionDepth}>
                    </label>
                    <label class="flex items-center gap-2">
                        Profondeur max (références directes)
                        <input class="w-10 appearance-none"
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
                    <label class="flex items-center gap-2">
                        Afficher les références résolues
                        <input class="inline"
                            type="checkbox" bind:checked={settings.display.showResolvedReferences}>
                    </label>
                </div>
            </div>
        </details>
        <details bind:open={sections.paths} class="flex flex-col open:gap-2">
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
                        <Operation open operation={{
                            method,
                            path,
                            operationData: data
                        }} />
                    {/each}
                {/each}
            </div>
        </details>
        <details bind:open={sections.schemas.open} class="flex flex-col open:gap-2">
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
                        class="bg-gray-50 rounded border border-gray-200
                        target:animate-hightlight"
                    >
                        <Schema
                            open={sections.schemas.innerOpen}
                            schemaName={name}
                            schema={schema as any}
                            resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
                        />
                    </div>
                {/each}
            </div>
        </details>
    </main>
</div>
