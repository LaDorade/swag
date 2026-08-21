<script lang="ts">
    import { specStore } from "./stores/Spec.svelte";
    import Parameter from "./Parameter.svelte";
    import type { ParameterObject, ReferenceObject } from "#types/oas.js";

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
            } else {
                console.warn(`Unsupported Param type: ${paramResolution.obj.in}`)
            }
        }
        return acc;
    }, {
        pathParams: [] as ParameterObject[],
        queryParams: [] as ParameterObject[]
    }));
</script>

{#snippet paramList(title: string, params: ParameterObject[])}
    <div class="flex flex-col not-last:border-b border-gray-300 not-last:pb-2">
        <span class="px-2 text-gray-700 font-bold text-base mb-1">{title}</span>
        <ul class="px-2 flex flex-col gap-2 list-disc list-inside">
            {#each params as param (param)}
                <div class="not-first:border-t border-gray-200 py-2">
                    <Parameter {param} />
                </div>
            {/each}
        </ul>
    </div>
{/snippet}

<div class="parameters flex flex-col gap-2 leading-6">
    {#if pathParams.length}
        {@render paramList('Path Params', pathParams)}
    {/if}
    {#if queryParams.length}
        {@render paramList('Query Params', queryParams)}
    {/if}
</div>
