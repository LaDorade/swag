<script lang="ts">
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

<details open class="p-1 flex flex-col gap-2 border rounded border-gray-200">
    <summary class="text-lg">Parameters</summary>
    {#if pathParams.length}
        <span class="">Path Params</span>
        <ul class="flex flex-col gap-2 list-disc list-inside">
            {#each pathParams as param (param)}
                <li>{param.name}: {JSON.stringify(param.schema)}</li>
            {/each}
        </ul>
    {/if}
    {#if queryParams.length}
        <span class="">Query Params</span>
        <ul class="flex flex-col gap-2 list-disc list-inside">
            {#each queryParams as param (param)}
                <li>{param.name}: {JSON.stringify(param.schema)}</li>
            {/each}
        </ul>
    {/if}
</details>
