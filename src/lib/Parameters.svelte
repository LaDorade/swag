<script lang="ts">
    import Schema from "./Schema/Schema.svelte";
    import type { ParameterObject, ReferenceObject } from "#types/oas.js";
    import { specStore } from "./stores/Spec.svelte";
    import { settings } from "./stores/Settings.svelte";

    interface Props {
        parameters: (ParameterObject | ReferenceObject)[]
    }

    let {
        parameters
    }: Props = $props()

    let {queryParams, pathParams} = $derived(parameters.reduce((acc, param) => {
        const paramResolution = specStore.evaluate<ParameterObject>(param);
        if (paramResolution.ok) {
            if (paramResolution.obj.in === 'path') {
                acc.pathParams.push(paramResolution.obj)
            } else if (paramResolution.obj.in === 'query') {
                acc.queryParams.push(paramResolution.obj)
            }
        }
        return acc;
    }, {
        pathParams: [] as ParameterObject[],
        queryParams: [] as ParameterObject[]
    }));
</script>

{#snippet paramList(title: string, params: ParameterObject[])}
    <span class="px-2 font-bold">{title}</span>
    <ul class="flex flex-col gap-0 list-disc list-inside">
        {#each params as param (param)}
            {#if param.schema}
                <Schema
                    schemaName={param.name}
                    schema={param.schema}
                    resolutionDepth={settings.resolution.schemaMaxResolutionDepth}
                />
            {:else if param.content}
                <span class="text-red-500">Not supported "Content" in parameters</span>
            {:else}
                <span class="italic text-gray-500">Nothing here...</span>
            {/if}
        {/each}
    </ul>
{/snippet}

<div class="parameters flex flex-col leading-6">
    {#if pathParams.length}
        {@render paramList('Path Params', pathParams)}
    {/if}
    {#if queryParams.length}
        {@render paramList('Query Params', queryParams)}
    {/if}
</div>
