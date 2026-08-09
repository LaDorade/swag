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
        // TODO: make this generic between all referencable objects
        if ('$ref' in param) {
            const res = specStore.resolve<ParameterObject>(param);
            // FIXME: handle multiples ref
            if (!res || '$ref' in res) return acc;
            param = res;
        }
        if (param.in === 'path') {
            acc.pathParams.push(param)
        } else if (param.in === 'query') {
            acc.queryParams.push(param)
        }
        return acc;
    }, {
        pathParams: [] as ParameterObject[],
        queryParams: [] as ParameterObject[]
    }));
</script>

{#snippet paramList(title: string, params: ParameterObject[])}
    <span class="font-bold">{title}</span>
    <ul class="flex flex-col gap-2 list-disc list-inside pl-2">
        {#each params as param (param)}
            <Schema
                name={param.name}
                schema={param.schema}
                resolutionDepth={3}
            />
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
