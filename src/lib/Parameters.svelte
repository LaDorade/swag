<script lang="ts">
    import Schema from "./Schema/Schema.svelte";
    import type { ParameterObject, ReferenceObject } from "#types/oas.js";
    import { specStore } from "./stores/Spec.svelte";

    interface Props {
        parameters: (ParameterObject | ReferenceObject)[]
    }

    let {
        parameters
    }: Props = $props()

    let {queryParams, pathParams} = $derived(parameters.reduce((acc, param) => {
        const resolved = specStore.resolveObject<ParameterObject>(param);
        if (resolved) {
            if (resolved.in === 'path') {
                acc.pathParams.push(resolved)
            } else if (resolved.in === 'query') {
                acc.queryParams.push(resolved)
            }
        }
        return acc;
    }, {
        pathParams: [] as ParameterObject[],
        queryParams: [] as ParameterObject[]
    }));
</script>

{#snippet paramList(title: string, params: ParameterObject[])}
    <span class="font-bold">{title}</span>
    <ul class="flex flex-col gap-0 list-disc list-inside pl-2">
        {#each params as param (param)}
            {#if param.schema}
                <Schema
                    schemaName={param.name}
                    schema={param.schema}
                    resolutionDepth={3}
                />
            {:else if param.content}
                <span class="text-red-500">Not supported "Content" in parameters</span>
            {:else}
                <span class="italic text-gray-500">Nothing here...</span>
            {/if}
        {/each}
    </ul>
{/snippet}

<div class="flex flex-col leading-6">
    {#if pathParams.length}
        {@render paramList('Path Params', pathParams)}
    {/if}
    {#if queryParams.length}
        {@render paramList('Query Params', queryParams)}
    {/if}
</div>
