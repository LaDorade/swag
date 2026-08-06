<script lang="ts">
    import Schema from "./Schema/Schema.svelte";

    interface Props {
        parameters: {
          name: string;
          in: string; // TODO: only in 'query' 'path' and others
          description?: string;
          required?: boolean;
          explode?: boolean;
          schema: object;
        }[]
    }

    let {
        parameters
    }: Props = $props()

    let {queryParams, pathParams} = $derived(parameters.reduce((acc, val) => {
      if (val.in === 'path') {
        acc.pathParams.push(val)
      } else if (val.in === 'query') {
        acc.queryParams.push(val)
      }
      return acc;
    }, {
      pathParams: [] as Props['parameters'],
      queryParams: [] as Props['parameters'],
    }));
</script>

{#snippet paramList(params: Props['parameters'])}
    <ul class="flex flex-col gap-2 list-disc list-inside pl-2">
        {#each params as param (param)}
            <Schema name={param.name} schema={param.schema}
                resolutionDepth={3} />
        {/each}
    </ul>
{/snippet}

<details open class="p-1 flex flex-col gap-2 border rounded border-gray-200">
    <summary class="text-lg">Parameters</summary>
    {#if pathParams.length}
        <span class="">Path Params</span>
        {@render paramList(pathParams)}
    {/if}
    {#if queryParams.length}
        <span class="">Query Params</span>
        {@render paramList(queryParams)}
    {/if}
</details>
