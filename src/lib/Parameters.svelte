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

{#snippet paramList(title: string, params: Props['parameters'])}
    <span class="font-bold">{title}</span>
    <ul class="flex flex-col gap-2 list-disc list-inside pl-2">
        {#each params as param (param)}
            <Schema name={param.name} schema={param.schema}
                resolutionDepth={3} />
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
