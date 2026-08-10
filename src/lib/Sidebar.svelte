<script lang="ts">
    import { getOperationAnchor, getSchemaAnchor } from "#lib";
    import { specStore } from "./stores/Spec.svelte";

    const { spec } = specStore;
    const schemas = spec?.components?.schemas ?? {};
    const paths = spec?.paths ?? {};
</script>

<nav class="shrink-0 w-64 h-full flex flex-col p-2 border-r shadow border-gray-200 overflow-y-auto">
    <h2 class="text-lg border-b border-gray-200">
        <a href="#paths">Paths</a>
    </h2>
    <ul class="pt-2 text-gray-700 font-mono text-sm">
        {#each Object.entries(paths) as [path, methodData] (path)}
            {#each Object.entries(methodData) as [method, {summary}] (method)}
                {@const anchor = getOperationAnchor(method, path)}
                <li title="{summary}">
                    <a class="flex items-baseline gap-1 py-0.5 px-1" href="#{anchor}">
                        <span class="text-center uppercase min-w-15">{method}</span>
                        <div class="flex items-baseline gap-1 min-w-0">
                            <span class="truncate min-w-0">{path}</span>
                            <span class=" text-gray-600 italic text-xs font-sans truncate shrink-8000">{summary}</span>
                        </div>
                    </a>
                </li>
            {/each}
        {/each}
    </ul>
    <h2 class="text-lg pt-2 border-b border-gray-200">
        <a href="#schemas">Schemas</a>
    </h2>
    <ul class="pt-2 text-gray-700 font-mono text-sm">
        {#each Object.keys(schemas) as schemaName (schemaName)}
            {@const anchor = getSchemaAnchor(`#/components/schemas/${schemaName}`)}
            <li title="{schemaName}">
                <a class="flex items-baseline gap-1 py-0.5 px-1" href="#{anchor}">
                    <span>{schemaName}</span>
                </a>
            </li>
        {/each}
    </ul>
    <h1 class="mt-auto text-xl">Swag</h1>
</nav>
