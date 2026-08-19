<script lang="ts">
    import Schema from "./Schema/Schema.svelte";
    import Example from "./Example.svelte";
    import SchemaExample from "./Schema/SchemaExample.svelte";
    import { settings } from "./stores/Settings.svelte";

    import type { UnresolvedSchema } from "#types";
    import type { ExampleObject, ReferenceObject } from "#types/oas.js";

    interface Props {
        // FIXME: on fait quoi si on a rien du tout ?
        examples?: Record<string, ExampleObject | ReferenceObject>;
        // FIXME: determiner ce qu'on fait/si cela a du sens, quand on a pas de schéma
        schema?: UnresolvedSchema;
        class?: string;
    }
    let {
        examples,
        schema,
        class: className = ''
    }: Props = $props();

    let examplesName = $derived(Object.keys(examples ?? {}).concat(['__auto__']));
    let activeExampleName: string = $derived(examplesName[0])
    let tabs = [
        {
            label: 'Example value',
            value: 'examples',
        },
        {
            label: 'Schema',
            value: 'schema',
        }
    ] as const;
    let activeTab: 'examples' | 'schema' = $state('examples');

</script>

<div class="flex flex-col gap-4 bg-gray-50 rounded {className}">
    <nav class="flex leading-6 ">
        {#each tabs as tab (tab.value)}
            <button
                onclick={() => (activeTab = tab.value)}
                class:underline={activeTab === tab.value}
                class="text-sm leading-6 text-gray-700 border-gray-400 first:border-r first:pl-0 px-2 cursor-pointer">
                {tab.label}</button>
        {/each}

        <div class="ml-auto text-sm flex items-baseline gap-2">
            {#if activeTab === 'examples'}
                <span class="text-gray-600">
                    Example:
                </span>
                <select
                    class="px-2 italic border border-gray-300 rounded"
                    bind:value={activeExampleName}>
                    {#each examplesName as example (example)}
                        <option class="w-fit"
                            value={example}>{example.toString()}</option>
                    {/each}
                </select>
            {/if}
        </div>
    </nav>
    <div class="border border-gray-200 rounded bg-white">
        {#if activeTab === 'examples' && (examples || schema)}
            {#key activeExampleName}
                {#if activeExampleName === '__auto__'}
                    <SchemaExample
                        {schema}
                        resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
                    />
                {:else}
                    <Example
                        name={activeExampleName}
                        example={examples?.[activeExampleName] ?? null}
                    />
                {/if}
            {/key}
        {:else if activeTab === 'schema' && schema}
            <Schema open
                schemaName={null}
                {schema}
                resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
            />
        {:else}
            <span class="flex items-baseline gap-2 px-2 text-sm leading-8 font-mono">
                <span>Missing examples and/or schema</span>
            </span>
        {/if}
    </div>
</div>
