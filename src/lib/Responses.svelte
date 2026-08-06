<script lang="ts">
    import Response from "./Response.svelte";

    interface Props {
        responses: Record<string, {
            content: object;
            description: string;
            summary?: string;
        }>
    }

    let {
        responses: opResponses
    }: Props = $props()

    let responses = $derived(Object.entries(opResponses ?? {}))
</script>

<details open class="p-1 flex flex-col gap-2 border rounded border-gray-200">
    <summary class="text-lg">Responses</summary>
    {#each responses as [code, response] (code)}
        <Response response={{
          ...response,
          code
        }} />
    {/each}
</details>
